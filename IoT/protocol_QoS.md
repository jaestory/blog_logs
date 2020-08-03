# MQTT Protocol - QoS(Quality of Service)

IoT Service는 무선 네트워크 망을 주로 사용하여 통신하기 때문에 유선 통신에 비해서 안정성이 상대적으로 낮다.  
이러한 불안정함을 Protocol 상에서 보완하기 위해 **QoS(Quality of Service)**라는 안정성을 위한 **서비스의 질**이라는 개념을 도입했다.

## QoS Level
하지만 모든 통신에서 완전성을 갖춰야 하는 것은 아니다.  
서비스의 요구 사항에 따라서, 그리고 통신이 이뤄지는 환경이나 메시지의 종류에 따라서 안정성이 강화되어야 하는 상황이 있을 것이다.

QoS Level은 아래의 3가지로 정의한다.

### QoS 0 : At most once - Fire & Forgot
QoS Level 0에서는 메시지를 전송(Publish)한 뒤, Publish Event를 잊는다.  
즉, 전송한 메시지를 관리하지 않기 때문에 한번에 전송이 성공하지 않는다면 재전송 등이 발생하지 않으며 Publish Event가 실패하는 것으로 통신이 마무리 된다.

### QoS 1 : At least once
QoS Level 1에서는 전송(Publish)한 메시지가 최소 1회 전달된다.  
일반적인 경우, 1번 메시지를 보내게 되며 Publish를 한 Client는 PUBACK packet을 받음으로써 전송한 메시지가 정상적으로 전달되었음을 알게 된다.

하지만, 메시지를 전송한 Client가 PUBACK을 받지 못하는 경우, Client는 Publish가 실패했다고 판단하여 QoS Level의 기준에 맞춰 다시 한번 메시지를 전송하게 된다.  
이 때, 메시지를 수신하는 대상은 동일한 메시지를 2번 전달받게 되는 경우가 발생하기 때문에 QoS Level 1에서는 최소 1번 메시지가 전달되는 상황이 발생한다.

### QoS 2 : Exactly once
마지막 QoS Level 2에서는 PUBACK의 과정을 3-Way Hand Shaking하여 통신으로 주고받는 메시지가 정확하게 1번만 발생하도록 하였다.  
QoS Level 1에서는 Publish <-> PUBACK의 이벤트로 메시지의 전송과 전송 완료에 대한 이벤트를 구분하게 되었다.

하지만, QoS Level 2에서는 MQTT Broker가 메시지의 정상 수신 및 발신 여부를 확인함으로써 1회의 통신이 가능하도록 강제하고 있다.
1. Client가 메시지를 Publish 하고, Broker는 이 메시지를 수신자에게 전달한다.
2. Broker는 Client에게 메시지가 전달되었음을 알리는 PUBREC(Publish Recevied) 이벤트를 보낸다.
3. PUBREC 이벤트를 catch한 Client는 다시 Broker에 PUBREL(Publish Release) 메시지를 보내서 Broker에서 저장 중이던 메시지를 삭제한다.
4. 마지막으로 메시지를 정상종료 한 뒤, PUBCOMPLETE 이벤트로 해당 통신을 종료한다.
만약, 위의 QoS Level 1에서와 같이 Client가 Publish한 뒤, 그에 대한 응답 메시지를 받지 못한 경우가 QoS Level 2에서 발생한다면

QoS Level 1에서는 Client가 다시 Publish 하는 메시지가 수신자에게까지 전달되는 것에 반해
QoS Level 2에서는 Broker Level에서 해당 메시지의 id를 기반으로 메시지 유무를 파악하여 수신자가 동일 메시지를 받지 않도록 한다.