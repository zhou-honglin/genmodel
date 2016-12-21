//
//  {{name}}.h
//
//  Created by generator script on {{date}}.
//  Copyright © {{year}}年 steven sun. All rights reserved.
//
#import "Model.h"

{{each classNames as value index}}
@class {{value}};
{{/each}}

@interface {{name}} : Model

{{each properties as value index}}
@property (nonatomic, {{value.qualifier}}) {{#value.type}} {{value.key}};
{{/each}}

@end