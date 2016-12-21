# genmodel
genmodel 可以使用命令根据json文件生成object-c的model,避免重复的劳动
## 安装
	npm install genmodel -g
## 如何使用
genmodel -h 可得到下面使用说明
	`Usage: genmodel [options]
	
	Options:
	  -i, --inPath        the json source file path              [string] [required]
	  -o, --outPath       the model output file path                        [string]
	  -n, --name          the name of the root model,will apply prefix or suffix for
	                      root model and all nest models if exists
	                                                             [string] [required]
	  -p, --class_prefix  the model className of prefix                     [string]
	  -s, --class_suffix  the model className of suffix                     [string]
	  -k, --key           the key for json object to generate model         [string]
	  -m, --class_map     the map className for the nest object or array; use -m
	                      ".products=product",also apply prefix or suffix   [string]
	  -t, --template      the template for modelClass,use "iPadModel" or "YYModel"
	                      or custom template path,default "iPadModel"       [string]
	  -h, --help          Show help                                        [boolean]
	
	Examples:
	  genmodel -n User -p JD -s Model -i xxx.json -o ~/Desktop 
	  generate JDUserModel with the xxx.json to Desktop
	
	copyright 2016`
	
###注意事项
* prefix 和 suffix会应用到 name指定的className 以及 嵌套的 className
* 自定义模板传入一个目录，命令规则为 :假设目录名XXXModel 则XXXModel 里的.h和.m文件的文件名为 XXXModelH.tpl 和 XXXModelM.tpl,模板语法参照 [artTemplate](https://github.com/aui/artTemplate/wiki/syntax:simple)
* -k(--key)的含义为指定 根对象 所对应的键路径，例如:
```
{
    "orderId": 104,
    "totalPrice": 103.45,
    "products": [
        {
            "id": 123,
            "name": "Product #1",
            "price": 12.95,
            "productIn": {
                "idInArr": 123,
                "name": "Product name",
                "price": 12.95
            }
        }
    ],
    "productOut": {
        "id": 123,
        "name": "Product name",
        "price": 12.95,
		"productIn": {
                "idIn": 123,
                "name": "Product name",
                "price": 12.95
            }
    }
}
```
指定 `-k '.products.0.productIn' -n product` 则只会以productIn的json生成product类,--key 可以嵌套，以"."开头，以文件json的根对象开始遍历，数组只能指定索引为 0
* -m(--class_map)是嵌套对象类命名映射，规则为`.productOut=product,.userB=user`以"."开头，可以嵌套路径，从根对象开始(如有-key，则为-key指定的根对象)，以逗号分隔，中间不要留空格 如以上json 执行 `genmodel -n order  -i xxx.json -m '.productOut=product' `则生成order类,product类
* -i -k 指定的json文件的根对象需为一个Dictionary



