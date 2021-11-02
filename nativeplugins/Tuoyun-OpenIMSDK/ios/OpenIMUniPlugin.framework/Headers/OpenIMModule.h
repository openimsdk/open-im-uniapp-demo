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

@interface OpenIMModule : DCUniModule <Open_im_sdkIMSDKListener, Open_im_sdkOnAdvancedMsgListener, Open_im_sdkOnFriendshipListener, Open_im_sdkOnConversationListener, Open_im_sdkOnGroupListener>

- (void)pushEvent:(NSString *) eventName msg:(nullable id) msg;

@end

NS_ASSUME_NONNULL_END
