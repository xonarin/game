import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './GameUpgraderUPG.scss';
import { cn } from '../../utils/bem-css-module';
import {
    InventoryItemUpgFragment,
    ItemsSortUpg,
    ItemUpgFragment,
    PlayGameUpgMutation,
} from '../../__generated__/graphql';
import { calcUpgradeWindow, isChanceInRange, toCents } from '../../services/upgrade/game';
import useMeQuery from '../../hooks/graphql/users/useMeQuery';
import useUpgradeConfigUPGQuery from '../../hooks/graphql/upgrade/useUpgradeConfigUPGQuery';
import useInventoryUPGQuery from '../../hooks/graphql/upgrade/useInventoryUPGQuery';
import useUpgradeItemsUPGQuery from '../../hooks/graphql/upgrade/useUpgradeItemsUPGQuery';
import useUpgradeItemUPGQuery from '../../hooks/graphql/upgrade/useUpgradeItemUPGQuery';
import usePlayGameUPGMutation from '../../hooks/graphql/upgrade/usePlayGameUPGMutation';
import useItemsFilter from '../../hooks/useItemsFilter';
import PreLoader from '../../components/PreLoader/PreLoader';
import ItemsToolbar from '../../components/ItemsToolbar/ItemsToolbar';
import Pagination from '../../components/ItemsToolbar/Pagination/Pagination';
import ItemCardUPG from './components/ItemCardUPG/ItemCardUPG';
import ChanceDialUPG from './components/ChanceDialUPG/ChanceDialUPG';
import BetPanelUPG from './components/BetPanelUPG/BetPanelUPG';
import TargetPanelUPG from './components/TargetPanelUPG/TargetPanelUPG';
import ItemsGridUPG from './components/ItemsGridUPG/ItemsGridUPG';
import CoinsUPG from './components/CoinsUPG/CoinsUPG';
import ShopUPG from './components/ShopUPG/ShopUPG';
import { ceilCents, floorCents, formatCoins, formatPercent } from './format';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const SPIN_MS = 4000;
const TARGETS_PAGE_SIZE = 20;

type QuickPick = { label: string; kind: 'multiplier' | 'chance'; value: number };

const QUICK_PICKS: QuickPick[] = [
    { label: 'x2', kind: 'multiplier', value: 2 },
    { label: 'x4', kind: 'multiplier', value: 4 },
    { label: 'x8', kind: 'multiplier', value: 8 },
    { label: '35%', kind: 'chance', value: 0.35 },
    { label: '55%', kind: 'chance', value: 0.55 },
    { label: '75%', kind: 'chance', value: 0.75 },
];

type GameResult = PlayGameUpgMutation['playGameUPG'];

interface PlayedGame {
    key: number;
    result: GameResult;
    // Что было на столе в момент игры: инвентарь перечитывается сразу, а стрелка ещё крутится
    betItems: InventoryItemUpgFragment[];
    coins: number;
    target: ItemUpgFragment;
}

type Phase = 'idle' | 'spinning' | 'done';
type BottomTab = 'inventory' | 'shop';

const cnUpgrader = cn(s, 'GameUpgraderUPG');

const round2 = (value: number) => Math.round(value * 100) / 100;

// ── COMPONENT ─────────────────────────────────────────────────────────────────

const GameUpgraderUPG: React.FC = () => {
    useStyles(s);

    const { config } = useUpgradeConfigUPGQuery();
    const { me } = useMeQuery();
    const balance = me?.money ?? 0;
    const { inventory, loading: inventoryLoading, refetch: refetchInventory } = useInventoryUPGQuery();
    const { play, loading: playing } = usePlayGameUPGMutation();

    // ── Ставка ────────────────────────────────────────────────────────────────
    // Несколько своих скинов в ставку (не больше config.maxBetItems), в порядке выбора
    const [betItemIds, setBetItemIds] = useState<string[]>([]);
    // Занятый скин (на выводе, в другом режиме) ставкой быть не может; ушедший из инвентаря — тоже
    const betItems = useMemo(
        () =>
            betItemIds
                .map(id => inventory.find(item => item.id === id && !item.locked))
                .filter((item): item is InventoryItemUpgFragment => Boolean(item)),
        [betItemIds, inventory],
    );
    const hasBetItems = betItems.length > 0;
    const skinValue = round2(betItems.reduce((sum, item) => sum + item.value, 0));
    const toggleBetItem = (id: string) =>
        setBetItemIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

    // Цель выбирается независимо от ставки: смена или снятие скина ставки её не сбрасывает
    const [target, setTarget] = useState<ItemUpgFragment | null>(null);

    // Свежая цена выбранной цели (при выборе и после отказа сервера) — даже если её нет в текущем списке целей
    const { item: freshTarget, refetch: refetchTarget } = useUpgradeItemUPGQuery(target?.id ?? null);
    useEffect(() => {
        if (target && freshTarget && freshTarget.id === target.id && freshTarget.price !== target.price) {
            setTarget(freshTarget);
        }
    }, [target, freshTarget]);
    const targetUnavailable = Boolean(target) && freshTarget === null;

    // Монеты: не больше баланса и maxBet, а при выбранной цели — пока шанс не выше maxChance.
    // шанс = coef × ставка / цена → ставка ≤ цена × maxChance / coef (вниз до цента)
    const [coins, setCoins] = useState(0);
    const maxBetForTarget =
        config && target ? floorCents((target.price * config.maxChance) / config.frontendCoef) : Infinity;
    const maxCoins = config
        ? Math.max(0, floorCents(Math.min(balance, config.maxBet - skinValue, maxBetForTarget - skinValue)))
        : 0;
    useEffect(() => {
        if (coins > maxCoins) setCoins(maxCoins);
    }, [coins, maxCoins]);
    // Монеты добавляются только к скинам: без скинов в ставке ползунок выключен и сброшен
    useEffect(() => {
        if (!hasBetItems && coins !== 0) setCoins(0);
    }, [hasBetItems, coins]);

    const betValue = round2(skinValue + coins);
    const markup = config?.targetItemMarkup ?? 1;

    // ── Цель ──────────────────────────────────────────────────────────────────
    const [quickPick, setQuickPick] = useState<QuickPick | null>(null);
    const quickMultiplier = useMemo(() => {
        if (!quickPick || !config) return 0;
        return quickPick.kind === 'multiplier' ? quickPick.value : config.frontendCoef / quickPick.value;
    }, [quickPick, config]);

    // Список целей: от ставка × max(targetItemMarkup, быстрый выбор, coef / maxChance) — дешевле шанс был бы выше
    // потолка; до ставка × coef / minChance — дороже шанс был бы ниже минимума
    const minTargetMultiplier = config
        ? Math.max(markup, quickMultiplier, config.frontendCoef / config.maxChance)
        : markup;
    const minTargetPrice = betValue > 0 ? ceilCents(betValue * minTargetMultiplier) : 0;
    const maxTargetPrice = betValue > 0 && config ? floorCents((betValue * config.frontendCoef) / config.minChance) : 0;

    // Фильтры пользователя (поиск, цена от/до, сортировка) поверх пределов ставки.
    // Без ставки — все скины, дорогие первыми; со ставкой — подходящие, дешёвые первыми
    const targetFilter = useItemsFilter({ pageSize: TARGETS_PAGE_SIZE, defaultSort: hasBetItems ? 'asc' : 'desc' });
    const { query: targetQuery } = targetFilter;
    const userMin = targetQuery.minPrice ?? 0;
    const userMax = targetQuery.maxPrice ?? Infinity;
    const queryMax = betValue > 0 ? Math.min(maxTargetPrice, userMax) : userMax;
    const {
        items: targets,
        total: targetsTotal,
        loading: targetsLoading,
        refetch: refetchTargets,
    } = useUpgradeItemsUPGQuery({
        search: targetQuery.search || null,
        minPrice: Math.max(minTargetPrice, userMin),
        maxPrice: Number.isFinite(queryMax) ? queryMax : null,
        sort: targetQuery.sort === 'asc' ? ItemsSortUpg.PriceAsc : ItemsSortUpg.PriceDesc,
        limit: TARGETS_PAGE_SIZE,
        offset: targetQuery.offset,
    });

    // Быстрый выбор: самый дешёвый скин с нужным множителем
    const autoPickRef = useRef(false);
    useEffect(() => {
        if (autoPickRef.current && !targetsLoading && targets.length > 0) {
            autoPickRef.current = false;
            setTarget(targets[0]);
        }
    }, [targets, targetsLoading]);

    // ── Игра ──────────────────────────────────────────────────────────────────
    const [phase, setPhase] = useState<Phase>('idle');
    const [game, setGame] = useState<PlayedGame | null>(null);
    const spinTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(spinTimer.current), []);

    // Любое изменение стола после игры — снова режим выбора
    const resetOutcome = useCallback(() => {
        if (phase === 'done') setPhase('idle');
    }, [phase]);

    const upgradeWindow = useMemo(
        () =>
            config && target && betValue > 0
                ? calcUpgradeWindow(toCents(betValue), toCents(target.price), config.frontendCoef)
                : null,
        [config, target, betValue],
    );

    const spinning = phase === 'spinning';
    // Пределы ставки (скин + монеты) и шанса — те же, что проверяет сервер
    const betTooLow = Boolean(config) && betValue < config!.minBet;
    const betTooHigh = Boolean(config) && betValue > config!.maxBet;
    const chanceOk =
        Boolean(config && upgradeWindow) &&
        isChanceInRange(upgradeWindow!.chance, config!.minChance, config!.maxChance);
    const canPlay =
        Boolean(config && hasBetItems && target && upgradeWindow) &&
        !targetUnavailable &&
        !betTooLow &&
        !betTooHigh &&
        chanceOk &&
        !spinning &&
        !playing;

    const onUpgrade = async () => {
        if (!canPlay || !target || !upgradeWindow) return;

        const response = await play({
            betAmount: coins,
            betItemIds: betItems.map(item => item.id),
            targetItemId: target.id,
            targetMultiplier: upgradeWindow.multiplier,
        });
        const result = response?.data?.playGameUPG;
        if (!result) {
            // Ошибка уже показана уведомлением. Частая причина — цены изменились: перечитываем их,
            // шанс и потолок монет пересчитаются по новым
            refetchInventory();
            refetchTargets();
            refetchTarget();
            return;
        }

        setGame(prev => ({ key: (prev?.key ?? 0) + 1, result, betItems, coins, target }));
        setPhase('spinning');
        setBetItemIds([]); // поставленные скины ушли из инвентаря в любом исходе

        clearTimeout(spinTimer.current);
        spinTimer.current = setTimeout(() => setPhase('done'), SPIN_MS);
    };

    // ── Что показываем ────────────────────────────────────────────────────────
    const showGame = phase !== 'idle' && game;
    const shownBetItems = spinning && game ? game.betItems : betItems;
    const shownTarget = showGame ? game.target : target;
    const shownChance = showGame ? game.result.chance : (upgradeWindow?.chance ?? 0);
    const shownWinStart = showGame ? game.result.winStart : (upgradeWindow?.winStart ?? null);
    const shownWinEnd = showGame ? game.result.winEnd : (upgradeWindow?.winEnd ?? null);
    let outcome: 'win' | 'lose' | null = null;
    if (phase === 'done' && game) {
        outcome = game.result.win ? 'win' : 'lose';
    }

    const hint = (() => {
        if (spinning) return 'Крутим…';
        if (!hasBetItems) return 'Выберите скины для ставки';
        if (betTooLow) return `Минимальная ставка ${formatCoins(config!.minBet)} — добавьте монеты или скин дороже`;
        if (betTooHigh) return `Максимальная ставка ${formatCoins(config!.maxBet)}`;
        if (!target) return 'Выберите скин, который хотите получить';
        if (targetUnavailable) return 'Этот скин сейчас недоступен — выберите другой';
        if (!upgradeWindow) return 'Шанс вне допустимого диапазона';
        if (!chanceOk && upgradeWindow.chance < config!.minChance) {
            return `Минимальный шанс ${formatPercent(config!.minChance)} — увеличьте ставку или выберите скин дешевле`;
        }
        if (!chanceOk) {
            return `Максимальный шанс ${formatPercent(config!.maxChance)} — уменьшите ставку или выберите скин дороже`;
        }
        return null;
    })();

    // ── Магазин / инвентарь ───────────────────────────────────────────────────
    const [tab, setTab] = useState<BottomTab>('inventory');

    const bottomTabs = (
        <span className={cnUpgrader('Tabs')}>
            <button
                type="button"
                className={cnUpgrader('Tab', { active: tab === 'inventory' })}
                onClick={() => setTab('inventory')}
            >
                Мои скины
            </button>
            <button
                type="button"
                className={cnUpgrader('Tab', { active: tab === 'shop' })}
                onClick={() => setTab('shop')}
            >
                Магазин
            </button>
        </span>
    );

    if (!config) {
        return <PreLoader />;
    }

    return (
        <div className={cnUpgrader()}>
            {/* ── Верх: ставка — шанс — цель ─────────────────────────────── */}
            <div className={cnUpgrader('Top')}>
                <BetPanelUPG
                    betItems={shownBetItems}
                    coins={spinning && game ? game.coins : coins}
                    betValue={
                        spinning && game
                            ? round2(game.betItems.reduce((sum, item) => sum + item.value, 0) + game.coins)
                            : betValue
                    }
                    burned={outcome === 'lose'}
                    onRemoveItem={id => {
                        if (spinning) return;
                        toggleBetItem(id);
                        resetOutcome();
                    }}
                />

                <div className={cnUpgrader('Center')}>
                    <ChanceDialUPG
                        chance={shownChance}
                        rollRange={config.rollRange}
                        winStart={shownWinStart}
                        winEnd={shownWinEnd}
                        roll={game ? game.result.roll : null}
                        spinKey={game?.key ?? 0}
                        spinMs={SPIN_MS}
                        outcome={outcome}
                    />
                    {outcome && game && (
                        <div className={cnUpgrader('Outcome', { win: game.result.win })}>
                            {game.result.win ? 'Апгрейд удался!' : 'Не повезло — скин сгорел'}
                            <span className={cnUpgrader('Fair')}>
                                Бросок {game.result.roll}, окно {game.result.winStart}–{game.result.winEnd}, nonce{' '}
                                {game.result.nonce}
                            </span>
                        </div>
                    )}
                </div>

                <TargetPanelUPG
                    target={shownTarget}
                    won={outcome === 'win'}
                    onClear={() => {
                        if (spinning) return;
                        setTarget(null);
                        resetOutcome();
                    }}
                />
            </div>

            {/* ── Середина: монеты — кнопка — быстрый выбор ──────────────── */}
            <div className={cnUpgrader('Controls')}>
                <div className={cnUpgrader('Slider')}>
                    <span className={cnUpgrader('SliderHead', { disabled: !hasBetItems })}>
                        <span>Сумма баланса:</span>
                        <span>
                            <CoinsUPG amount={coins} size="s" />{' '}
                            <span className={cnUpgrader('SliderMax')}>(max {formatCoins(maxCoins)})</span>
                        </span>
                    </span>
                    <input
                        type="range"
                        aria-label="Монеты к ставке"
                        min={0}
                        max={maxCoins}
                        step={0.01}
                        value={coins}
                        disabled={spinning || !hasBetItems || maxCoins <= 0}
                        onChange={event => {
                            setCoins(round2(Number(event.target.value)));
                            resetOutcome();
                        }}
                    />
                </div>

                <div className={cnUpgrader('Action')}>
                    <button type="button" className={cnUpgrader('Upgrade')} disabled={!canPlay} onClick={onUpgrade}>
                        ⌃ Улучшить
                    </button>
                    {hint && <span className={cnUpgrader('Hint')}>{hint}</span>}
                </div>

                <div className={cnUpgrader('QuickPicks')}>
                    {QUICK_PICKS.map(pick => (
                        <button
                            key={pick.label}
                            type="button"
                            className={cnUpgrader('QuickPick', {
                                kind: pick.kind,
                                active: quickPick?.label === pick.label,
                            })}
                            disabled={spinning || betValue <= 0}
                            onClick={() => {
                                const same = quickPick?.label === pick.label;
                                setQuickPick(same ? null : pick);
                                autoPickRef.current = !same;
                                if (!same) {
                                    targetFilter.setSort('asc');
                                    targetFilter.setPage(1);
                                }
                                resetOutcome();
                            }}
                        >
                            {pick.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Низ: мои скины / магазин — выбор цели ───────────────────── */}
            <div className={cnUpgrader('Bottom')}>
                {tab === 'shop' ? (
                    <ShopUPG head={bottomTabs} balance={balance} maxUnits={config.maxBuyUnits} />
                ) : (
                    <ItemsGridUPG
                        head={
                            <>
                                {bottomTabs}
                                {hasBetItems && (
                                    <span className={cnUpgrader('Picked')}>
                                        В ставке {betItems.length} из {config.maxBetItems}
                                    </span>
                                )}
                                <span className={cnUpgrader('Total')}>
                                    Всего скинов{' '}
                                    <CoinsUPG amount={inventory.reduce((sum, item) => sum + item.value, 0)} size="s" />
                                </span>
                            </>
                        }
                        loading={inventoryLoading}
                        empty="Скинов пока нет — купите в магазине"
                    >
                        {inventory.map(inventoryItem => {
                            const selected = betItemIds.includes(inventoryItem.id);
                            // Новый скин в ставку — пока не набран лимит; занятый — нельзя
                            const canSelect =
                                !inventoryItem.locked && (selected || betItems.length < config.maxBetItems);
                            return (
                                <ItemCardUPG
                                    key={inventoryItem.id}
                                    item={inventoryItem.item}
                                    price={inventoryItem.value}
                                    selected={selected}
                                    onClick={
                                        canSelect
                                            ? () => {
                                                  if (spinning) return;
                                                  toggleBetItem(inventoryItem.id);
                                                  resetOutcome();
                                              }
                                            : undefined
                                    }
                                    footer={
                                        inventoryItem.locked ? (
                                            <span className={cnUpgrader('Locked')}>Занят</span>
                                        ) : undefined
                                    }
                                />
                            );
                        })}
                    </ItemsGridUPG>
                )}

                <ItemsGridUPG
                    head={
                        <>
                            <span>Выберите скин</span>
                            {betValue > 0 && (
                                <span className={cnUpgrader('Total')}>
                                    от <CoinsUPG amount={minTargetPrice} size="s" /> до{' '}
                                    <CoinsUPG amount={maxTargetPrice} size="s" />
                                </span>
                            )}
                        </>
                    }
                    toolbar={<ItemsToolbar filter={targetFilter} />}
                    footer={
                        <Pagination
                            page={targetFilter.page}
                            pageSize={targetFilter.pageSize}
                            total={targetsTotal}
                            onChange={targetFilter.setPage}
                        />
                    }
                    loading={targetsLoading}
                    empty={targetsLoading ? 'Загрузка…' : 'Нет подходящих скинов'}
                >
                    {targets.map(item => (
                        <ItemCardUPG
                            key={item.id}
                            item={item}
                            selected={item.id === target?.id}
                            onClick={() => {
                                if (spinning) return;
                                setTarget(item.id === target?.id ? null : item);
                                resetOutcome();
                            }}
                        />
                    ))}
                </ItemsGridUPG>
            </div>
        </div>
    );
};

export default GameUpgraderUPG;
