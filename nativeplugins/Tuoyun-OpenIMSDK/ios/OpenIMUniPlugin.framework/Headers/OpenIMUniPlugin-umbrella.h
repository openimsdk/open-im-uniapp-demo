#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "CallbackProxy.h"
#import "OpenIMModule.h"
#import "SendMessageCallbackProxy.h"

FOUNDATION_EXPORT double OpenIMUniPluginVersionNumber;
FOUNDATION_EXPORT const unsigned char OpenIMUniPluginVersionString[];

