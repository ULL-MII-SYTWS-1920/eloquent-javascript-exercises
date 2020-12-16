class Group {
  constructor() {
    this.list = [];
  }
  add(elt) {
    if (!this.has(elt)) this.list.push(elt);
  }
  delete(elt) {
    if (this.has(elt)) this.list.splice(this.list.indexOf(elt), 1);
  }
  has(elt) {
    return this.list.indexOf(elt) !== -1;
  }
  static from(iterable) {
    let result = new Group();
    for (const elt of iterable) {
      result.add(elt);
    }
    return result;
  }
  *[Symbol.iterator] () {
    for (let i = 0; i < this.list.length; i++) {
      yield this.list[i];
    }
  }
}

let group = Group.from([10, 20]);
console.log(group.has(10));
// → true
console.log(group.has(30));
// → false
group.add(10);
group.delete(10);
console.log(group.has(10));
// → false

for (let value of Group.from(['a', 'b', 'c'])) {
  console.log(value);
}
// → a
// → b
// → c
