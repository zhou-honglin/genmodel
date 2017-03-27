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

- (instancetype)initWithDic:(NSDictionary *)dic
{
    if(self = [super initWithDic: dic])
    {
        if(validateDictionary(dic))
        {
            {{each properties as value index}}
            {{if value.jstype == 'string'}}self.{{value.key}} = toValidateString(dic[@"{{value.key}}"]);
            {{else if value.type == 'NSInteger'}}self.{{value.key}} = [toValidateNumber(dic[@"{{value.key}}"]) integerValue];
            {{else if value.type == 'float'}}self.{{value.key}} = [toValidateNumber(dic[@"{{value.key}}"]) floatValue];
            {{else if value.jstype == 'boolean'}}self.{{value.key}} = [toValidateNumber(dic[@"{{value.key}}"]) boolValue];
            {{else if value.jstype == 'object'}}
            if(validateDictionary(dic[@"{{value.key}}"])){
                self.{{value.key}} = [[{{value.className}} alloc] initWithDic:dic[@"{{value.key}}"]];
             }
            {{else if value.jstype == 'array' && value.className}}
            NSArray *{{value.key}}Dics = toValidateArray(dic[@"{{value.key}}"]);
            NSMutableArray<{{value.className}}*> *{{value.key}}Objs = [NSMutableArray array];
            for(NSDictionary *dic in {{value.key}}Dics){
                if(validateDictionary(dic)){
                    {{value.className}} *obj = [[{{value.className}} alloc] initWithDic:dic];
                    if(obj) [{{value.key}}Objs addObject:obj];
                }
            }
            self.{{value.key}} = {{value.key}}Objs;
            {{else if value.jstype == 'array'}}
            self.{{value.key}} = toValidateArray(dic[@"{{value.key}}"]);
            {{/if}}
            {{/each}}
        }
    }
    return self;
}

@end