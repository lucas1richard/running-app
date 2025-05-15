type Action = 'put' | 'delete';
type LRUPutReturn = { action: Action, key: string };

class LRUCache {
  private cache: Map<string, any>;
  private capacity: number;

  constructor(capacity: number) {
    this.cache = new Map();
    this.capacity = capacity;
  }

  get(key: string): any {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }

    return -1;
  }

  put(key: string, value: any): LRUPutReturn {
    const returnVal: LRUPutReturn = { action: 'put', key };
    
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const deleteKey = this.cache.keys().next().value;
      this.cache.delete(deleteKey);
      returnVal.action = 'delete';
      returnVal.key = deleteKey;
    }

    this.cache.set(key, value);

    return returnVal;
  }
}

export default LRUCache;
