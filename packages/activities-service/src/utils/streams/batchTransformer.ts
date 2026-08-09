import { Transform, type TransformOptions } from 'node:stream';

class BatchTransformer extends Transform {
  batch: any[];
  batchSize: number;

  constructor(batchSize = 30, options?: TransformOptions) {
    super({ ...options, objectMode: true });
    this.batch = [];
    this.batchSize = batchSize;
  }

  _transform(row, enc, cb) {
    this.batch.push(row);
    if (this.batch.length >= this.batchSize) {
      this.push(this.batch);
      this.batch = [];
    }
    cb();
  }

  _flush(cb) {
    if (this.batch.length > 0) {
      this.push(this.batch);
    }
    cb();
  }
}

export {
  BatchTransformer
};