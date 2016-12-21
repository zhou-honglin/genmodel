//
//  {{name}}.m
//
//  Created by generator script on {{date}}.
//  Copyright © {{year}}年 steven sun. All rights reserved.
//

#import "{{name}}.h"

{{each classNames as value index}}
#import "{{value}}.h"
{{/each}}

@implementation {{name}}
{{if existsArray}}
+ (NSDictionary *)modelContainerPropertyGenericClass {
    return @{ 
        {{each properties as value index}}
          {{if value.jstype == 'array'}}
            @"{{value.key}}":{{value.className}}.class,
          {{/if}}
        {{/each}}
    };
}
{{/if}}
@end