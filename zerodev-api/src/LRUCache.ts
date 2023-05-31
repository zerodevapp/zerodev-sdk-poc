export default class LRUCache<K, V> extends Map<K, V> {
    private maxSize: number;

    constructor(maxSize = 200) {
        super();
        this.maxSize = maxSize;
    }

    get(key: K): V | undefined {
        let item: V | undefined = super.get(key);
        if (item) {
            // remove and set the item to reposition it at the end
            super.delete(key);
            super.set(key, item);
        }
        return item;
    }

    set(key: K, value: V): this {
        // if the key already exists, delete it first so it gets repositioned at the end
        if (super.has(key)) {
            super.delete(key);
        } else if (super.size >= this.maxSize) {
            // the key is new, if we're at maxSize, delete the least recently used item
            const firstKey = this.keys().next().value;
            if (firstKey) {
                super.delete(firstKey);
            }
        }
        super.set(key, value);
        return this;
    }
}

// usage
let cache = new LRUCache<string, number>(200);