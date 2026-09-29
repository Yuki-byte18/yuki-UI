//ts实现bem命名规范
//总体格式：prefixName-blockSuffix__element--modifier
//         前缀名-B__E--M   （前缀名 = yuki-组件名）

//架构设计：封装三层函数：
//1，_bem: 底层用于生成bem命名规范的类名 **仅仅底层拼接字符串**
//2，createBEM: 中层生成一个bem对象 拥有b,e,m,be,bm,em,is方法 **拥有各种语义化方法**
//3，createNamespace: 上层调用createBEM函数 生成一个bem对象 **定制化前缀名**

//1，_bem
function _bem(prefixName: string, blockSuffix?: string, element?: string, modifier?: string) {
  let className = prefixName
  if (blockSuffix) {
    className += `-${blockSuffix}`
  }
  if (element) {
    className += `__${element}`
  }
  if (modifier) {
    className += `--${modifier}`
  }
  return className
}

//2,createBEM
function createBEM(prefixName: string) {
  const b = (blockSuffix: string = '') => _bem(prefixName, blockSuffix)
  const e = (element: string = '') => element ? _bem(prefixName, '', element) : ''
  const m = (modifier: string = '') => modifier ? _bem(prefixName, '', '', modifier) : ''
  const be = (blockSuffix: string = '', element: string = '') => _bem(prefixName, blockSuffix, element)
  const bm = (blockSuffix: string = '', modifier: string = '') => _bem(prefixName, blockSuffix, '', modifier)
  const em = (element: string = '', modifier: string = '') => _bem(prefixName, '', element, modifier)
  const is = (stateName: string = '', condition: boolean) => condition ? 'is-' + stateName : ''
  return {
    b,
    e,
    m,
    be,
    bm,
    em,
    is
  }
}

//3,createNamespace
export function createNamespace(name: string) {
  const prefixName = `yuki-${name}`
  return createBEM(prefixName)
}

//我的理解：
//实际上我就是要实现一个可以定制化前缀的创建bem对象的方法
//bem对象有e，m，b，be等等等等方法 执行这些方法就可以合成bem类名
// 至于为什么不直接使用底层字符串拼装函数 
// 是因为这样就不直观 别人一看你传了一些参数 不知道哪一个是b哪一个是e哪一个是m 
// 不然你还要自己记住传参顺序 每次传参还要保证不把顺序记错了 那太傻逼了 
// 那我封装一个有b，e，m，be，bm等等方法的对象 就很直观 
// 我想合成be 那就用这个 我想em那就用这个 这样十分直观 我不用记忆传参顺序 
// 我想要哪个就用哪个对应方法 
// 至于为什么最外面还要封装一个 而不是直接使用创建这个对象的方法 
// 是因为我每个不同的组件 我要不同前缀的bem字符串啊 
// 所以最外层封装的作用是 定制化前缀

