//
//  OpenIMModule.h
//  OpenIMUniPlugin
//
//  Created by Snow on 2021/6/24.
//

#import <Foundation/Foundation.h>
#import "DCUniModule.h"
#import "CallbackProxy.h"
@import OpenIMCore;

NS_ASSUME_NONNULL_BEGIN

@interface OpenIMModule : DCUniModule <Open_im_sdk_callbackOnConnListener,Open_im_sdk_callbackOnUserListener, Open_im_sdk_callbackOnAdvancedMsgListener, Open_im_sdk_callbackOnFriendshipListener, Open_im_sdk_callbackOnConversationListener, Open_im_sdk_callbackOnGroupListener>

- (void)pushEvent:(NSString *) eventName msg:(nullable id) msg;

@end

NS_ASSUME_NONNULL_END
