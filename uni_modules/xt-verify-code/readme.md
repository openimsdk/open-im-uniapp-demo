# 验证码输入框
## 使用方法
```vue
<xt-verify-code v-model="verifyCode" @confirm="confirm"></xt-verify-code>
```
## 插件使用了scss，安装本插件之前，请选择安装scss

### 参数
|属性						|类型		|说明																								|默认值	|
|--							|--			|--																									|--			|
|value(v-model)	|string	|值(可双向绑定)																			|''			|
|type						|string	|验证输入框类型可选值: box、middle、bottom					|box		|
|inputType			|string	|输入类型 可选值：text、number											|number	|
|size						|number	|验证码长度 可选值: 1、2、3、4、5、6								|6			|
|isFocus				|boolean|是否一开始聚焦																			|true		|
|isPassword			|boolean|是否使用密码方式显示																|false	|
|cursorColor		|string	|光标颜色																						|#cccccc|
|boxNormalColor	|string	|显示框未选中的颜色																	|#cccccc|
|boxActiveColor	|string	|显示框选中的颜色如果type='middle' 则是线的默认样式	|#000000|
|@confirm				|event	|输入完成的回调事件  {(code)=>{}}										|				|