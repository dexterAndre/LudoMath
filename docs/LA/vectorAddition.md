## Vector Addition
Adds two vectors together. Must be of same dimension. 

## Functions
Name | Functionality
- | - 
add(v) | Adds v to <span class="blue">this</span> and returns a new vector. Analogous to the + operator. 
addThis(v) | Adds v to <span class="blue">this</span>. Analogous to the += operator. 

### Example (Code)
```
var a = new Vec2(3, 4);
var b = new Vec2(-2, 1);
var a_b = a.add(b);
console.log("a: ", a);
// Output: "a: Vec2 {x: 3, y: 4}"
console.log("b: ", b);
// Output: "b: Vec2 {x: -2, y: 1}"
console.log("a_b: ", a_b);
// Output: "a_b: Vec2 {x: 1, y: 5}"
a.addThis(b);
console.log("a: ", a);
// Output: "a: Vec2 {x: 1, y: 5}"
```

### Example (Visual)
<p>Given the two vectors \\(\overrightarrow{a} = [3, 4]\\) and \\(\overrightarrow{b} = [-2, 1]\\), </p>
<img src="imgs/vectorAdditionVariables.png">
<p>let \\(\overrightarrow{c} = \overrightarrow{a} + \overrightarrow{b}\\). </p>

## Properties of Vector Addition
Returns | Operands | Validity | Cost | Commutative | Associative | Distributive
- | - | - | - | - | - | - 
Vector of same dimension | Binary | Vec2, Vec3, Vec4 | <p class="green">true</p> | <p class="green">true</p> | <p class="green">true</p> | <p class="green">true</p>