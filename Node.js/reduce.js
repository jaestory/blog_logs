/**
 * Array에서 반복문을 처리하는 여러가지 방법이 있다.
 * 가장 먼저 학습하게 되는 for loop, JavaScript의 내장 메소드(대부분 언어에 동일하게 포함)인 forEach와 map, reduce 등을 순서대로 배우는 것이 일반적이다.
 * 
 * 코드 리뷰의 횟수가 늘어나고, 다른 사람이 작성한 코드를 읽거나 디버깅을 해야되는 상황이 잦아지면서 점차 가독성 높은 코드를 작성하기 위한 방법에 대한 고민이 늘어나기 시작했다.
 * 고민 사항과 그 과정에서 수정을 하게 된 여러가지 부분들이 있었지만, 그 중에서 가장 빨리 습관화를 하고자 했던 부분이 Array에 대한 Loop처리 였다.
 */

// Reduce란?

/**
 * Array 내장 메소드 중 가장 유용하고, 가장 강력한 메소드를 꼽으라고 하면 주저 없이 첫번째를 reduce, 두번째를 map으로 뽑을 것 같다.
 * (MapReduce라는 프레임워크가 등장한 것은 역시 Map과 Reduce의 역할이 크기 때문이 아닐까?
 * 
 * MDN 문서에 따르면, reduce() 메소드는 배열(Array)의 각 요소에 대해 주어진 reducer(리듀서) 함수를 실행하고, 하나의 결과값을 반환하는 것이다.
 * 영단어 reduce의 본래 의미인 "줄이다"와 같이 주어진 배열의 요소를 하나의 최종 값으로 "줄이는" 메소드인 것이다.
 * 
 * const reducer = (acc, cur, idx?, src?) => {};
 * array.reduce(reducer, initialValue?)
 * 
 * reduce 메소드의 사용 방법은 위 코드에서 2번째 줄과 같다.
 * forEach나 map 등 Array 메소드와 동일한 호출 방식을 사용하며, callback 함수를 첫번째 인자로 넣고 Optional Value로 Callback 함수(reducer)의 첫번째 인자로 사용하기 위한 InitaialValue를 두 번째 인자로 넣는다.
 * 만약, Initial Value가 지정되지 않을 경우에는 주어진 array의 0번째 인덱스에 해당하는 원소가 최초값으로 설정된다.
 * 
 * 중요한 reducer 함수는 위 코드의 첫번째 줄과 같다.
 * 첫번째 인자인 acc(accumulator)는 reducer 함수(callback)에서 return되는 값을 누적하게 된다. Array의 첫번째 호출인 경우에는 위에서 언급한 것과 같이 initialValue 인자 여부에 따라 acc가 정해진다.
 * cur은 reducer 함수가 처리할 현재 요소로 array에서 순서대로 값이 정해지며, Optional Value인 idx는 이 때의 인덱스를 말한다.
 * 마지막으로 src는 reduce 메소드를 호출한 배열이다.
 */

// reduce 메소드 사용 예시
// 가장 대표적인 reduce 사용 방법은 Array내 원소의 누적 합을 구하는 것이다.
const arr = [1, 2, 3, 4, 5];
const result = arr.reduce((acc, cur) => {
  return acc + cur;
}, 0)
console.log(result) // 15

// 위의 예시는 reduce 사용법을 검색하면 항상 나오는 예제지만, 실제 활용과는 괴리감이 있는 예시가 아닐까?

// Array에 대한 모든 처리가 비동기로 이뤄져야 하는 경우, 아래와 같은 코드를 일반적으로 사용한다.
const foo = async () => {
  await Promise.all(
    arr.map(async (elem) => {
      await elem.asyncCall();
    })
  )
}

// 위의 코드는 아래와 같이 변경가능하다.
const foo = async () => {
  const awaits = [];
  arr.map((elem) => awaits.push(elem.asyncCall()));
  await Promise.all(awaits)
}

// 비동기로 처리되어야 하는 함수들을 awaits라는 array에 저장해둔 다음에 이를 Promise.all()로 한꺼번에 처리하는 방법도 가능하다.

// 만약, 위에서 map을 사용한 것을 reduce로 변경한다면 어떻게 할 수 있을까?
const foo = async (arr) => {
  const awaits = arr.reduce((acc, cur) => {
    return acc.push(cur.asyncCall());
  }, [])
  await Promise.all(awaits);
}
// 빈 Array를 선언하는 것이 아니라 처리해야되는 대상들을 저장한 Array를 reduce 메소드를 사용하여 만드는 것이 가능하다.
// 하지만, 결국에는 1회성으로 사용되는 awaits라는 변수가 필요하다는 점은 아쉬운 부분이기 때문에
// 비동기 처리가 필요한 Array에서 reduce 메소드를 사용하는 방법을 알아둘 필요가 있다.

// reduce를 이용한 비동기 Promise 사용법
// 정답부터 먼저 작성하자면 아래의 코드와 같다.

arr.reduce(async (acc, cur) => {
  const let = await acc.then();
  return let.push(await cur.asyncCall());
}, promise.resolve([]));
// Promise.resolve(value) 메서드는 주어진 값으로 이행하는 Promise.then 객체를 반환한다.
// 따라서 초기값을 Promise.resolve()로 선언한 뒤, return되는 누적 값을 then 메소드를 사용하여 실제 값을 확인한뒤, reducer 함수의 로직을 처리하게 되는 것이다.
// 이 과정에서 Promise가 순차적으로 실행됨을 보장할 수 있다.