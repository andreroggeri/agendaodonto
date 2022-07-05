export interface IMatcher {
    name: string;
    prettyName: string;
}

/**
 * Search filters by name in the stack and returns the pretty name
 */
export function getReversedMatchField(matcher: string, stack: IMatcher[]) {
    const matched = stack.find(el => el.name === matcher);
    if (matched !== undefined) {
        return matched.prettyName;
    }
    return stack[0].prettyName;
}

/**
 * Search filters by prettyName in the stack and returns the filter name
 */
export function getMatchedField(matcher: string, stack: IMatcher[]) {
    const matched = stack.find(el => el.prettyName === matcher);
    if (matched !== undefined) {
        return matched.name;
    }
    return stack[0].name;
}
