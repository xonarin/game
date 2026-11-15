import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Pagination.scss';
import { cn } from '../../../utils/bem-css-module';

export interface PaginationProps {
    /** Текущая страница, с 1. */
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
    className?: string;
}

const cnPagination = cn(s, 'Pagination');

/** Номера страниц вокруг текущей, с первой и последней и «…» между ними: 1 … 4 5 [6] 7 8 … 20. */
const pageNumbers = (page: number, pages: number): Array<number | '…'> => {
    const around = new Set([1, pages, page - 2, page - 1, page, page + 1, page + 2]);
    const sorted = [...around].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);

    return sorted.flatMap((n, index) => (index > 0 && n - sorted[index - 1] > 1 ? ['…' as const, n] : [n]));
};

/** Пагинация: стрелки и номера страниц. Одна страница — не показывается. */
const Pagination: React.FC<PaginationProps> = ({ page, pageSize, total, onChange, className }) => {
    useStyles(s);

    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (pages <= 1) return null;

    return (
        <nav className={cnPagination(null, [className])} aria-label="Страницы">
            <button
                type="button"
                className={cnPagination('Button')}
                disabled={page <= 1}
                onClick={() => onChange(page - 1)}
                aria-label="Предыдущая страница"
            >
                ‹
            </button>
            {pageNumbers(page, pages).map((n, index) =>
                n === '…' ? (
                    // eslint-disable-next-line react/no-array-index-key
                    <span key={`gap-${index}`} className={cnPagination('Gap')}>
                        …
                    </span>
                ) : (
                    <button
                        key={n}
                        type="button"
                        className={cnPagination('Button', { active: n === page })}
                        aria-current={n === page ? 'page' : undefined}
                        onClick={() => onChange(n)}
                    >
                        {n}
                    </button>
                ),
            )}
            <button
                type="button"
                className={cnPagination('Button')}
                disabled={page >= pages}
                onClick={() => onChange(page + 1)}
                aria-label="Следующая страница"
            >
                ›
            </button>
        </nav>
    );
};

export default Pagination;
