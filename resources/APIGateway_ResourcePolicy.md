# [AWS] API Gateway 리소스 정책 사용하기

AWS의 API Gateway는 간편하게 Public API 환경을 구축할 수 있는 서비스이다.  
인프라의 상당수가 AWS Resource로 구성되어 있다면, API Gateway를 활용하게 되는 Case가 많이 발생할 것이다.

하지만, API GW는 생성 시점부터 Access Control이 설정되지 않은 완전한 Public 구성으로 되어있기 때문에 보안상의 이슈와 직결될 수 밖에 없다.  
사내에 보안팀이 별도로 있다면, API GW의 필요성과 API에 대한 접근 제한을 요청하는 보안팀의 요청을 겪게 될 확률이 높다.

물론 AWS에서는 API에 대한 ACL 설정을 위해 리소스 정책(Resource Policy)을 제공하고 있다.  
리소스 정책에는 다음과 같은 3가지 기준을 설정할 수 있다.

- AWS 계정에 따른 허용(Allow) 목록
- IP범위에 따른 거부(Deny) 목록
- 소스 VPC 허용(Allow) 목록

## Policy 문서 구성

### AWS 계정 허용 목록

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::{{otherAWSAccountID}}:root",
                    "arn:aws:iam::{{otherAWSAccountID}}:user/{{otherAWSUserName}}",
                    "arn:aws:iam::{{otherAWSAccountID}}:role/{{otherAWSRoleName}}"
                ]
            },
            "Action": "execute-api:Invoke",
            "Resource": [
                "execute-api:/{{stageNameOrWildcard*}}/{{httpVerbOrWildcard*}}/{{resourcePathOrWildcard*}}"
            ]
        }
    ]
}
```

### IP 범위 거부 목록

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Deny",
            "Principal": "*",
            "Action": "execute-api:Invoke",
            "Resource": "execute-api:/{{stageNameOrWildcard}}/{{httpVerbOrWildcard}}/{{resourcePathOrWildcard}}",
            "Condition" : {
                "IpAddress": {
                    "aws:SourceIp": [ "{{sourceIpOrCIDRBlock}}", "{{sourceIpOrCIDRBlock}}" ]
                }
            }
        },
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "execute-api:Invoke",
            "Resource": "execute-api:/{{stageNameOrWildcard}}/{{httpVerbOrWildcard}}/{{resourcePathOrWildcard}}"
        }
    ]
}
```

### 소스 VPC 허용 목록

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Deny",
            "Principal": "*",
            "Action": "execute-api:Invoke",
            "Resource": "execute-api:/{{stageNameOrWildcard}}/{{httpVerbOrWildcard}}/{{resourcePathOrWildcard}}",
            "Condition": {
                "StringNotEquals": {
                    "aws:sourceVpc": "{{vpcID}}"
                }
            }
        },
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "execute-api:Invoke",
            "Resource": "execute-api:/{{stageNameOrWildcard}}/{{httpVerbOrWildcard}}/{{resourcePathOrWildcard}}"
        }
    ]
}
```

## API GW Resource Policy 구성 시 주의 사항

### 1. AWS 계정 허용 목록 사용 시, API 메소드 Auth 설정

AWS Docs(링크)에도 상세하게 나와있지만, 상기의 Policy Sample을 보면 AWS 계정 허용 목록의 차이점이 있다.  
정책의 Principal 항목이 AWS 계정 허용 목록에서만 "AWS"로 되어 있다.

Principal이 AWS로 설정된 경우에는 리소스 정책을 설정하고자 하는 API에 대하여 AWS_IAM 권한을 부여해야 한다.

AWS_IAM 권한을 부여하지 않을 경우, 정상적인 AWS 계정의 요청(User 또는 Role)일지라도  
API Gateway의 권한 확인 로직에서 해당 요청을 정상적으로 체크하지 못하여 모든 요청에 대한 권한 실패 403 응답이 발생하게 된다.

### 2. AWS 계정 허용 목록 사용 시, SigV4 프로토콜에 따른 인증 헤더 설정 필요

AWS Docs(링크)에 따르면, AWS 계정 허용 목록 시, SigV4 인증 헤더 설정이 필요하다.  
그도 그럴 것이 Target이 되는 API Gateway에서 AWS_IAM에 기반한 권한을 확인할 때,  
요청을 보내는 Source에서 AWS 계정과 관련된 공인 인증 정보를 포함해야만 Target API에서도 정상적인 인증 처리가 가능하기 때문이다.

SigV4 설정 프로세스는 AWS의 여러 공식 문서(링크)에서도 확인이 가능하다.  
단, 주의할 점은 API Gateway 호출을 위한 SigV4상의 serviceName은 execute-api이기 때문에 해당 값으로 설정 후, 전송하는 것이 필요하다.  
(참고로 Node.js 기반의 SigV4 헤더 설정은 다음의 Github(링크)에 추가해 두었으니, 확인하신 뒤 도움이 되셨다면 Star 부탁드립니다 :) )

### 3. Policy 문서 상의 Resource 정의시 wildcard(\*) 사용 주의

IAM Policy나 IoT Policy 등, 인프라 정책 문서를 작성해 본 경험이 있다면 당연한 얘기일 것이다.

Policy 구성 시, 정책 문서간 Over-write(덮어쓰기)이 발생하는 경우가 많다.

예시를 들어보자.

- /v1
- /v1/resources
- /v1/resources/{resourceId}  
  위와 같이 3개의 API가 있을 때, /v1 API에 대해서만 Public 접근을 유지시키고자 할 때 절대로 /v1\*과 같은 정책을 설정해서는 안된다.  
  Wildcard에 의해 다른 2개의 API에 대해서도 유효하게 정책이 영향을 미치기 때문이다.

### 4. Cross-Account 상황에서 AWS 계정 허용 목록 동작을 위한 조건

유일하게 AWS Docs에 정확하게 표기되지 않은 부분으로서 이 상황을 해결하기 위한 Trouble Shooting 시간이 길었던 경험이 있다.

AWS 계정에 의한 리소스 정책 사용시, API를 구축한 Target 계정과 API를 호출하는 Source계정 모두에서 정확한 권한 설정이 필요하다.

Target 계정에서의 설정은 상기의 1번 주의사항으로 Source 계정에서의 설정은 상기의 2번 주의사항으로 미리 언급한 바 있다.  
추가적으로 Cross-Account 상황이라면 Source 계정에 아래와 같은 IAM 권한을 추가해주어야 한다.

```
{
    "Effect": "Allow",
    "Action": [
    	"execute-api:Invoke"
    ],
    "Resource": [
    	"arn:aws:execute-api:{{targetAWSRegion}}:{{targetAWSAccountID}}:{{targetAWSAPIGWId}}/*"
    ]
}
```

위와 같은 권한을 User 또는 Role에 추가시켜야 한다.

Target 계정에서 요청에 대한 권한 및 인증 처리가 완료되었다고 할 지라도  
Source 계정에서 타 계정의 API를 호출할 수 있는 권한이 설정되어있지 않다면 당연히 요청에 대한 권한은 실패할 것이다.

**꼭! API GW를 호출하게 되는 계정의 IAM 권한에 위와 같은 정책 문서를 추가해야 한다.**

---

추가적으로!

현재 대부분의 Infra 관리는 Terraform을 사용하고 있다.  
API Gateway에 대한 배포 및 리소스 관리 역시 Terraform으로 관리 중에 있는데, 정말 아쉽게도 리소스 정책은 API Gateway에서 현재 지원이 안되고 있다.  
언젠가 리소스 정책 역시 Terraform에서 설정가능한 요소가 된다면 인프라 관리가 더욱 편리해지지 않을까 하는 생각을 하며 정말 오랜만의 블로그를 마무리한다.
