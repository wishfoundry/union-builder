# union-builder
A library for building and using union data types(a.k.a algebraic data types) in JS


# why

after using similar libraries such as https://github.com/paldepind/union-type, I found that I often needed something that could do just a little more. This library is the fruit of that effort with the following advantages:
- easy/automatic to use with JS native types
- able to  validate inputs, or provide default values
- able to validate related inputs or pairs, not just 1 input at a time
- easy to extend using simple pure function validators, and have enough context to yield informative/debuggable errors
- able to categorize union in 3 layers
- 1. is any type of union
- 2. is one of several unions
- 3. is an exact type
