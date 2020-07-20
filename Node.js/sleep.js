'use strict';

/**
 * 입력한 시간만큼 Code의 실행을 멈추는 일반적인 기능으로 sleep 함수가 있다.
 * 하지만 JavaScript에서는 내장된 sleep 기능이 없기 때문에 필요하다면, node_modules 중 delay 모듈을 사용하는 방법이 있을 것이다.
 * 만약, 외부 모듈을 설치하여 Sleep의 기능을 사용하는 것이 아니라고 한다면 JavaScript 내장 모듈 중에서 어떻게 활용할 수 있을까?
 * JavaScript에서는 입력된 시간이 지난 뒤 주어진 함수나 지정된 코드를 실행시키는 setTimeout 함수가 있다.
 */

// const timer = () => {
//   setTimeout(() => {}, 1000)
//   console.log('First');
//   setTimeout(() => {}, 1000);
//   console.log('Second');
// }
// timer();

// // First
// // Second
// // undefined

/**
 * setTimeout 함수의 사용 방법에 따라 위와 같이 샘플 코드를 작성할 수 있다.
 * 하지만 실제 위의 코드는 1초(1000ms)를 기다리고 2번의 console이 출력되는 것이 아니다.
 * 함수가 호출된 즉시 2번의 console이 출력되고, 그 이후 setTimout에 의해 비동기 처리 되는 함수의 결과가 출력되는 코드로 원하던 sleep의 결과가 나오지 않는다.
 * 이는 JavaScript에서 Callback 함수로 비동기 처리 방식이 이뤄지는 특성으로 인해서 나타나기 때문에 발생하는 상황이다.
 * 결국 setTimeout으로 지정한 Code line 자체를 asynchronous로 동작할 수 있게 만들어야된다.
 */

const _sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const timer = async () => {
  await _sleep(1000);
  console.log('First');
  await _sleep(1000);
  console.log('Second');
};
timer();

// Promise {<pending>}
// 1000ms sleep
// First
// 1000ms sleep
// Second

/**
 * setTimeout 내장 메소드를 사용하여 sleep이라는 함수를 promise 객체로 생성하여, sleep 함수를 비동기처리로 동작할 수 있게 호출한다면
 * 위의 결과와 같이 1초(1000ms) 간의 sleep이후 log가 출력되게 된다.
 */