//
//  {{name}}.h
//
//  Created by generator script on {{date}}.
//  Copyright © {{year}}年 steven sun. All rights reserved.
//
#import <Foundation/Foundation.h>

{{each classNames as value index}}
@class {{value}};
{{/each}}

@interface {{name}} : NSObject

{{each properties as value index}}
@property (nonatomic, {{value.qualifier}}) {{#value.type}} {{value.key}};
{{/each}}

@end