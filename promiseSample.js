
// 비동기 작업을 시뮬레이션하는 함수
function simulateAsyncOperation(data, delay) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  }
  
  // 동기식 함수
  function synchronousFunction() {
    console.log("동기 작업 시작");
    for (let i = 0; i < 3; i++) {
      console.log(`동기 작업 ${i + 1}`);
    }
    console.log("동기 작업 완료");
  }
  
  // Promise를 사용한 비동기 함수
  function promiseFunction() {
    console.log("Promise 작업 시작");
    return simulateAsyncOperation("Promise 결과", 2000)
      .then(result => {
        console.log(result);
        return simulateAsyncOperation("Promise 체인 결과", 1000);
      })
      .then(result => {
        console.log(result);
        console.log("Promise 작업 완료");
      });
  }
  
  // async/await를 사용한 비동기 함수
  async function asyncAwaitFunction() {
    console.log("Async/Await 작업 시작");
    const result1 = await simulateAsyncOperation("Async/Await 결과 1", 2000);
    console.log(result1);
    const result2 = await simulateAsyncOperation("Async/Await 결과 2", 1000);
    console.log(result2);
    console.log("Async/Await 작업 완료");
  }
  
  // 실행
  console.log("프로그램 시작");
  synchronousFunction();
  promiseFunction();
  asyncAwaitFunction();
  console.log("프로그램 종료");
