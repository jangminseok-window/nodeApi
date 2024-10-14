const name = "global name";
const obj = {
    name: "obj This",
    regularMethod: function() {
      console.log(this.name);
      
      setTimeout(function() {
        const name = "일반함수 this";
        console.log(name); // undefined (일반 함수) 일반함수는 자체  전역 객체 참조하는 this 생성하는데 객체가 없으니   
      }, 100);
      
      setTimeout(() => {
        const name = "일반함수 this";
        console.log(this.name); // "Example" (람다 함수)
      }, 100);
    }
  };
  
  obj.regularMethod();