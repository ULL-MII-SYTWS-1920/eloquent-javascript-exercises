function Promise_all(promises) {
  return new Promise((resolve, reject) => {
    if (!promises.length) resolve(promises);
    let pending = promises.length;
    let result = [];
    let order = '';
    promises.forEach((p, i) =>
      p
        .then(r => {
          pending--;
          result[i] = r;
          order += i;
          if (pending == 0) 
          {
            console.log("order: "+order);
            resolve(result);
          }
        })
        .catch(reject)
    );
  });
}

// Test code.
Promise_all([]).then(array => {
  console.log('This should be []:', array);
});

function soon(val) {
  return new Promise(resolve => {
    setTimeout(() => resolve(val), Math.random() * 500);
  });
}

Promise_all([soon(1), soon(2), soon(3)]).then(array => {
  console.log('This should be [1, 2, 3]:', array);
});

Promise_all([soon(5), soon(2), soon("a")]).then(array => {
  console.log('This should be [5, 2, "a"]:', array);
});

Promise_all([soon(1), Promise.reject('X'), soon(3)])
  .then(array => {
    console.log('We should not get here');
  })
  .catch(error => {
    if (error === 'X') {
      console.log('Rejection correctly managed!')
    } else 
      console.log('Unexpected failure:', error);
  });

Promise_all([
    soon(1), 
    new Promise(() => { throw(new Error('Muerto!')) }), 
    soon(3)
  ])
  .then(array => {
    console.log('We should not get here');
  })
  .catch(error => {
     if (/Muerto!/.test(error.message)) 
      console.log('Exception correctly managed!:');
  });
