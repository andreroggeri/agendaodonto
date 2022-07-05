export class BaseComponent {
    public defaultMatcher(item1, item2) {
        if (item1 && item2) {
            return item1.id === item2.id;
        }
        return false;
    }
}
