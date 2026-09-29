//注意：这里必须用 内联type 修饰符导入类型 (import { type Xxx })
//因为 play 项目的 tsconfig 开了 verbatimModuleSyntax 类型必须显式标记为 type
import { type ExtractPropTypes, type PropType } from "vue"
//入参配置对象 传在defineprops方法 括号里面


//组件需要的传入的参数

//组件传参第一种方法：配置对象法    defineProps（里面写配置对象）
//自己定义参数字段 每个字段可写配置对象
// type字段规范类型 required字段规定是否必须传 default字段默认默认值 validator字段校验函数 
// eg:
// {
//    color: {
//        type: String,
//        default: "green",
//        required: true,
//        validator: (val: string) => ["green", "red"].includes(val)
//           },
//    size: {
//        type: [String, Number],
//        default: 24,
//        validator: (val: number) => val > 0
//           }
// }
export const iconProps = {
  color: String,
  size: [String, Number] as PropType<string | number>,
  //是否让图标转圈圈 (一般给loading类图标用) 加了它之后 icon 组件既能显示图标又能当loading用
  spin: Boolean
} as const


//组件传参第二种方法：泛型接口法(尖括号里面传接口或者类型)
//eg:   defineProps<IconProps>()

//下面这个extractproptypes方法就相当于泛型传参法
//他配合上面代码的as const 使用 as const类型断言 常量断言
//可以锁死参数类型 下面extractproptypes才可以精确抽取类型
//如果不写as const 会类型放宽 则extractproptypes无法精确抽取类型 会报错
export type IconProps = ExtractPropTypes<typeof iconProps>


//***********超级重要的两种方法的区别***************
//第一种配置对象法是运行时校验参数类型 当代码跑在浏览器时才校验
//第二种泛型接口法是编译时校验参数类型 开发时就校验

//至于为什么编译时校验就是开发时一改代码就校验呢？
//开发时 tsc实时编译 把你改的代码一小部分词法分析语法分析生成迷你ast抽象语法树 进行语法校验

//二者还有一个区别 就是配置对象功能多一点 可配置type required default validator
//泛型接口法只能配置类型 或者用withDefaults方法添加默认值
//eg:   defineProps<IconProps>().withDefaults({
//    color: "green",
//    size: 24
// })
