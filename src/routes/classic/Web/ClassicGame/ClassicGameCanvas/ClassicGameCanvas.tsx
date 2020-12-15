import React, { CSSProperties } from 'react';
import { isEqual } from 'lodash';

export interface PlayerDrawableItem {
    startDegree: number;
    endDegree: number;
    color: string;
}

export interface ClassicGameCanvasProps {
    items: PlayerDrawableItem[];
    culminationDegree: number | null;
    remainingCulminationDuration: number | null;

    lineWidth?: number;
    animationDuration?: number;
    className?: string;
    innerRef?: React.RefObject<HTMLCanvasElement>;
}

export interface ClassicGameCanvasState {
    style: CSSProperties;
}

const PI2 = Math.PI * 2;

class ClassicGameCanvas extends React.Component<ClassicGameCanvasProps, ClassicGameCanvasState> {
    static defaultProps: Partial<ClassicGameCanvasProps> = {
        lineWidth: 20,
        animationDuration: 2000,
    };

    private readonly ref = this.props.innerRef || React.createRef<HTMLCanvasElement>();
    private prevItems: PlayerDrawableItem[] = this.props.items;
    private currentItems: PlayerDrawableItem[] = this.props.items;

    private ctx: CanvasRenderingContext2D | null = null;
    private canvasWidth: number = 0;
    private canvasHeight: number = 0;

    private animating: boolean = false;
    private startTimestamp: number = 0;

    state: ClassicGameCanvasState = {
        style: {},
    };

    constructor(props: Readonly<ClassicGameCanvasProps>) {
        super(props);

        this.tick = this.tick.bind(this);
        this.updateSize = this.updateSize.bind(this);
    }

    componentDidMount() {
        this.initCanvas();

        window.addEventListener('resize', this.updateSize);

        this.updateStyle();
    }

    shouldComponentUpdate(nextProps: Readonly<ClassicGameCanvasProps>, nextState: Readonly<ClassicGameCanvasState>) {
        return !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);
    }

    componentDidUpdate() {
        if (!isEqual(this.props.items, this.currentItems)) {
            this.startAnimation();
        }

        this.updateStyle();
    }

    componentWillUnmount() {
        this.stopAnimation();

        window.removeEventListener('resize', this.updateSize);
    }

    updateStyle() {
        const { culminationDegree, remainingCulminationDuration } = this.props;

        const style =
            typeof culminationDegree === 'number' && typeof remainingCulminationDuration === 'number'
                ? {
                      transform: `rotate(-${culminationDegree + 90}deg)`,
                      transition: `transform ${remainingCulminationDuration}ms cubic-bezier(0.45, 0.9, 0, 1)`,
                  }
                : {
                      transform: `rotate(0deg)`,
                      transition: `transform 0ms cubic-bezier(0.45, 0.9, 0, 1)`,
                  };

        setTimeout(() => {
            this.setState({ style });
        }, 0);
    }

    updateSize() {
        const { current: canvas } = this.ref;
        if (!canvas) return;

        this.canvasWidth = canvas.offsetWidth;
        this.canvasHeight = canvas.offsetHeight;

        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;

        this.draw();
    }

    initCanvas() {
        const { current: canvas } = this.ref;
        if (!canvas) return;

        this.ctx = canvas.getContext('2d');
        if (!this.ctx) return; // TODO: Может имеет смысл выкинуть ошибку

        this.updateSize();
    }

    startAnimation() {
        this.startTimestamp = Date.now();

        if (this.animating) {
            this.prevItems = this.currentItems;
        } else {
            this.animating = true;
            window.requestAnimationFrame(this.tick);
        }
    }

    stopAnimation() {
        this.prevItems = this.props.items;
        this.currentItems = this.props.items;
        this.animating = false;
    }

    tick() {
        if (!this.animating) return;

        this.update();
        this.draw();

        window.requestAnimationFrame(this.tick);
    }

    update() {
        const { items, animationDuration } = this.props;

        const duration = Date.now() - this.startTimestamp;
        if (duration >= animationDuration!) {
            this.stopAnimation();
            return;
        }

        const relation = duration / animationDuration!;
        this.currentItems = items.map((item, index) => {
            const prevItem = this.prevItems[index] || { startDegree: 360, endDegree: 360 };

            return {
                startDegree: prevItem.startDegree + (item.startDegree - prevItem.startDegree) * relation,
                endDegree: prevItem.endDegree + (item.endDegree - prevItem.endDegree) * relation,
                color: item.color,
            };
        });
    }

    draw() {
        if (!this.ctx) return; // TODO: Может имеет смысл выкинуть ошибку

        const { lineWidth } = this.props;

        const size = Math.min(this.canvasWidth, this.canvasHeight);
        const x = this.canvasWidth / 2;
        const y = this.canvasHeight / 2;
        const radius = size / 2;

        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.ctx.save();

        this.ctx.fillStyle = '#130f25';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, PI2);
        this.ctx.fill();

        this.ctx.fillStyle = '#17182e';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius - lineWidth!, 0, PI2);
        this.ctx.fill();

        this.ctx.lineWidth = lineWidth!;
        this.ctx.lineCap = 'round';

        this.currentItems.forEach(item => {
            if (!this.ctx) return; // TODO: Может имеет смысл выкинуть ошибку

            this.ctx.strokeStyle = item.color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius - lineWidth! / 2, (item.startDegree / 360) * PI2, (item.endDegree / 360) * PI2);
            this.ctx.stroke();
        });

        this.ctx.restore();
    }

    render() {
        const { className } = this.props;
        const { style } = this.state;

        return <canvas className={className} style={style} ref={this.ref} />;
    }
}

// export const ClassicGameCanvas1: React.FC<ClassicGameCanvasProps> = ({
//     items,
//     lineWidth = 20,
//     animationDuration = 2000,
//     className,
// }) => {
//     const [startTime, setStartTime] = useState(0);
//     const [prevItems, setPrevItems] = useState<PlayerDrawableItem[]>([]);
//
//     useDeepEffect(() => {
//         setStartTime(Date.now());
//     }, [items]);
//
//     useEffect(() => {
//         if (Date.now() < startTime + animationDuration) {
//         }
//     }, [animationDuration, startTime]);
//
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     useCanvasRendering(canvasRef, (ctx, width, height) => {
//         const size = Math.min(width, height);
//         const x = width / 2;
//         const y = height / 2;
//         const radius = size / 2;
//
//         ctx.clearRect(0, 0, width, height);
//
//         ctx.save();
//
//         ctx.fillStyle = '#130f25';
//         ctx.beginPath();
//         ctx.arc(x, y, radius, 0, PI2);
//         ctx.fill();
//
//         ctx.fillStyle = '#17182e';
//         ctx.beginPath();
//         ctx.arc(x, y, radius - lineWidth!, 0, PI2);
//         ctx.fill();
//
//         ctx.lineWidth = lineWidth;
//         ctx.lineCap = 'round';
//
//         items.forEach(item => {
//             ctx.strokeStyle = item.color;
//             ctx.beginPath();
//             ctx.arc(x, y, radius - lineWidth / 2, 0, 0);
//             ctx.stroke();
//         });
//
//         ctx.restore();
//     });
//
//     return <canvas className={className} ref={canvasRef} />;
// };

export default ClassicGameCanvas;
