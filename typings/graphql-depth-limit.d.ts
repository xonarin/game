declare module 'graphql-depth-limit' {
    import { ValidationRule } from 'graphql';

    interface DepthLimitOptions {
        ignore?: (string | RegExp | ((queryDepths: Record<string, number>) => boolean))[];
    }

    export default function depthLimit(
        maxDepth: number,
        options?: DepthLimitOptions,
        callback?: (queryDepths: Record<string, number>) => void,
    ): ValidationRule;
}
