# [MySQL] Explain_Query 동작 방식 및 성능 파악하기

DB Schema 설계는 Business Logic에 대한 이해로부터 비롯된다.  
이 때, Schema의 설계에는 2가지가 포함된다고 생각한다.  
Business Logic에 부합하는 Entity들을 구상하여 Entity들 간의 관계(Relation)를 확실하게 규정하는 것과  
실제 사용성의 측면에서 지나치게 복잡한 구조는 지양하여, 효과적인 쿼리 수행 성능을 위한 구조를 마련하는 것이 포함된다.

이 중, Entity 들 간의 관계를 규정하는 부분에 대해서는 아래 링크의 포스팅을 통해 언급한 적이 있다.

그렇다면 이번 글에서는 실제 DB를 사용하는 과정에서 효과적인 쿼리 수행 성능을 확인하고, 쿼리 동작 방식(계획)을 확인할 수 있는 MySQL의 기능인 Explain에 대해 설명을 해보고자 한다.

## EXPLAIN?
EXPLAIN은 MySQL 서버가 특정 query를 실행할 때, 이뤄지는 전반적인 쿼리 실행 방식에 대해 파악할 수 있는 내장 명령어이다.  
Query가 복잡해질 수록 query가 실행되는 순서를 query level에서 파악하기가 어렵기 때문에 도움이 될 수 있다.  
또한, index가 걸려있는 column을 기준으로 조회를 하는 query인지도 파악이 가능하다.

CRUD의 기본적인 query에 대해서는 EXPLAIN을 사용하면서 쿼리 실행 계획, 쿼리 동작 순서, 쿼리의 성능을 파악하는 효용이 크지 않지만,  
Query가 복잡해지면서 EXPLAIN의 필요성이 더 높아지게 된다.

## EXPLAIN 결과 및 설명

EXPLAIN을 사용하는 방법은 간단하다. Query 구문 앞에 EXPLAIN만 추가하면 된다.
```
EXPLAIN SELECT ~ FROM ~
```
(현재 개인 프로젝트로 사용 중에 있는 DB의 특정 query에 대하여 EXPLAIN을 사용한 결과를 기반으로 설명을 이어가보겠다.)

|id|select_type|table|partitions|type|possible_keys|key|key_len|ref|rows|filtered|Extra|
|---|---|---|---|---|---|---|---|---|---|---|---|
|1|SIMPLE|st|NULL|ALL|PRIMARY|NULL|NULL|NULL|83|11.11|	Using where|
|1|SIMPLE|rsct|NULL|ref|rsct_uk01, rsct_fk02|rsct_fk02|4|st.idx|10|100.00|Using where; Using index|
|1|SIMPLE|sc|NULL|eq_ref|PRIMARY|PRIMARY|4|rsct.comp_idx|1|10.00|Using where|
|1|SIMPLE|sm|NULL|eq_ref|PRIMARY|PRIMARY|4|sc.market_idx|1|100.00|NULL|
|1|SIMPLE|rscb|NULL|ref|PRIMARY|PRIMARY|4|rsct.comp_idx|1|100.00|Using index|
|1|SIMPLE|sb|NULL|eq_ref|PRIMARY|PRIMARY|4|rscb.buss_idx|1|100.00|NULL|

### id
id는 특정 쿼리의 실행 단위를 식별하는 값으로 MySQL은 Join을 하나의 단위로 실행하기 떄문에 Join만 실행하는 쿼리의 경우 위 결과처럼 id는 항상 1이 된다.

### select_type
이 값은 언제나 SIMPLE이다.

### table
어떤 테이블에 대해 접근을 한 쿼리인지 표시하고 있는 것으로 실제 query의 대상이 되는 table을 의미한다.  
위 결과는 query에서 대상 table에 대한 alias가 지정되어 있기 때문에 query에서 설정한 alias값이 결과로 나타난다.

### partitions
파티셔팅이 되어 있는 경우 사용되는 값으로 위 쿼리에서 사용된 table은 모두 파티셔닝이 되어 있지 않기 때문에 모두 NULL로 출력된다.  
만약 파티셔닝이 되어 있다면, 이 필드값을 확인할 필요가 있다.

### type
접근 방식 즉, 대상이 되는 table에서 어떻게 결과 데이터를 조회하는 방식을 표현하는 필드이다.  
EXPLAIN을 사용할 때 주의깊게 봐야하는 결과 중 하나가 이 type값이다.

대상 테이블로의 접근이 과연 효과적이고 효율적인 것인지를 판단할 수 있는 기준이 되기 때문에 가장 중요한 값 중 하나이다.

위 결과에 나온 type 결과와 자주 노출되는 type 결과가 어떤 의미인지 간략하게 나열 및 설명해보고자 한다.

- const : Primary Key, Unique Key에 의한 조회가 아닌 가장 외부의 테이블에 접근하는 방식으로서 결과는 항상 1행이 된다.
- ALL : 전체 행을 스캔 즉, 테이블 전체에 접근하는 방식이다.
- ref : Unique Key가 아닌 Index에 의한 비교로 여러 행에 대한 접근이 가능한 방식이다.
- eq_ref : const와 유사하지만 Join에 의한 내부 테이블에 접근하는 방식이다.

ALL 방식은 설명에서도 알 수 있듯 테이블의 전체 행에 대하여 접근하는 것이기 때문에 조회의 대상이 되는 데이터가 많기 때문에 효율 즉, 쿼리의 성능이 좋지 않다.  
위 결과에서 첫번째 열에 있는 쿼리는 where 조건을 지정하였지만, type이 ALL인 만큼 대상 테이블에 index 또는 key를 추가해야하거나 쿼리를 수정할 필요가 있을 수 있다.

### possible_keys
이용 가능성이 있는 index의 목록을 표시한다.

### key
possible_keys의 이용가능한 key목록들 중에서 실제로 쿼리 수행 시 사용된 인덱스가 key에 표시된다.

첫번째 열에서 possible_keys에 index가 있지만, key에 NULL이 표시된 이유는 결과 데이터를 가져오기 위해 인덱스를 사용할 수 없다는 뜻으로 인덱스가 잘못 설정되어있거나, 인덱스 자체가 설정되지 않았거나, 쿼리를 부적절하게 구성하였는지 등의 이유가 있을 것이다.

### key_len
선택된 index의 길이로 index가 너무 긴 것도 비효율적이다.

### rows
query를 수행한 결과 최종적으로 몇개의 행을 가져왔는지 표시한 결과이다.  
하지만 이 결과 값이 실제 행의 수와 반드시 일치하지는 않는다.

### filtered
결과 데이터를 가져온 뒤 검색 조건에 따라 최종적으로 남게되는 행이 얼마나 되는지를 비율로 표시한 결과값으로 이 또한 rows와 같이 반드시 실제 데이터와 일치하지 않을 수 있다.

### extra
이는 쿼리가 어떻게 실행되었는지를 파악할 수 있는 힌트가 되는 정보를 제공해주는 값으로 쿼리에서 어떤 행동이 이뤄졌는지 파악이 가능하다.

----------

Query는 원하는 데이터를 정확하게 얻을 수 있어야 되고, 실행 과정이 빠르게 이뤄져야 한다.  
Query 실행이 빠르게 이뤄지기 위해서는 조회의 대상이 되는 테이블로부터 검색을 하는 row의 수를 효과적으로 줄여갈 수 있어야 되며, MySQL 엔진에 특정 column에 대한 조회를 명령할 때, 해당 조회 대상을 명시적으로 지정할 수 있어야 된다.

이 것이 결국 어떻게 query의 type을 지정하고, 어떻게 rows를 축소할 수 있는 가에 달려있는 것이기 때문에 최초 쿼리를 작성한뒤, EXPLAIN 구문으로 쿼리의 보완점을 발견하고 수정해가야할 것이다.  
필요하다면 Table에 Index를 추가하는 것도 방법이 될 것이다.