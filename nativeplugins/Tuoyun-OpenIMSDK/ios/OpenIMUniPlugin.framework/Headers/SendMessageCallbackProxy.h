//
//  SendMessageCallbackProxy.h
//  OpenIMUniPlugin
//
//  Created by Snow on 2021/6/24.
//

#import <Foundation/Foundation.h>
#import "DCUniModule.h"
#import "OpenIMModule.h"
@import OpenIMCore;

NS_ASSUME_NONNULL_BEGIN

@interface SendMessageCallbackProxy : NSObject <Open_im_sdk_callbackSendMsgCallBack>

- (id)initWithMessage:(NSString *)msg module:(OpenIMModule *)module;

@end

NS_ASSUME_NONNULL_END
