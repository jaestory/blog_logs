# Roll-Up Query

Roll Up 쿼리는 Group By와 함께 사용되는 조건 구문이다.  
Group By 쿼리에 의해서 grouping된 결과에 대해서 보다 상세한 정보를 반환하는 기능을 수행한다.

ROLLUP 쿼리를 사용한다면 그룹화된 row들에 대한 중간 합(결과)에 대한 새로운 row가 추가되어 쿼리의 결과를 얻을 수 있게 된다.

아래의 정보들이 저장되어 있다고 할 경우, ROLLUP 쿼리를 쓴 결과는 아래와 같다.


|warehouse|product|model|quantity
|----|----|----|----|
|San Francisco|Apple|iPhone XS|	50
|San Francisco|Apple|iPad Pro|10
|San Francisco|Apple|Apple Watch|200
|San Francisco|Samsung|Z Flip|200
|San Francisco|Samsung|S12|100
|San Jose|Apple|iPhone XS|100
|San Jose|Apple|iPad Pro|50
|San Jose|Apple|Apple Watch|150
|San Jose|Samsung|Z Flip|200
|San Jose|Samsung|S12|150

```
SELECT warehouse, SUM(quantity)
	FROM inventory
    	GROUP BY ROLLUP(warehouse);
```

|warehouse|SUM(quantity)|
|---|---|
|San Francisco|560|
|San Jose|650|
|null|1210|

```
SELECT
	COALESCE(warehouse, 'All warehouses') AS warehouse,
    SUM(quantity)
    	FROM inventory
        	GROUP BY ROLLUP(warehouse);
```

|warehouse|SUM(quantity)|
|---|---|
|San Francisco|560|
|San Jose|650|
|All warehouses|1210|

SELECT 절에서 사용한 COALESCE함수는 Null 값을 2번째 입력한 값으로 대체하는 함수를 의미한다.

```
SELECT warehouse, product, SUM(quantity)
	FROM inventory
    	GROUP BY ROLLUP(warehouse, product);
```

|warehouse|product|SUM(quantity)|
|---|---|---|
|San Francisco|Apple|260|
|San Francisco|Samsung|300|
|San Francisco|null|560|
|San Jose|Apple|300|
|San Jose|Samsung|350|
|San Jose|null|650|
|null|null|1210|

위와 같이 2가지 조건 warehouse와 product를 동시에 grouping하는 경우라면 위와 같이 warehouse별 product 합을 구할 수 있다. 

서비스에 대한 통계를 도출해야 하는 경우 ROLLUP 조건과 같은 방법을 사용하여 효과적인 쿼리를 짤 수 있다.