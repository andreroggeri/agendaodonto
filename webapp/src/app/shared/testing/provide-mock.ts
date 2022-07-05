import { MockFactory } from 'jasmine-mock-factory';

export function provideMock<T extends object>(c: T) {
    return { provide: c, useFactory: () => MockFactory.create(c) };
}
