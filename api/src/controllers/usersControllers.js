const{User} =require("../db")

const regexName=/^([A-Za-zÑñÁáÉéÍíÓóÚú]+['\-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú]+)(\s+([A-Za-zÑñÁáÉéÍíÓóÚú]+['\-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú]+))*$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const register=async({name,email,password,role})=>{
    const errors={}
    
    if(name=="") errors.name="Debe ingresar su nombre!";
    else if(name.length<2) errors.name="nombre muy corto!";
    else if(!regexName.test(name)) errors.name = "Debe ingresar un nombre válido!"

    if(email=="") errors.email="Debe ingresar su email!";
    else if(!emailRegex.test(email)) errors.email="Debe ingresar un email válido!"

    if(role=="") errors.role="Debe seleccionar un rol!";

    if(password=="") errors.password="Debe ingresar una contraseña!";
    else if(password.length<5) errors.password="Contraseña muy corta!";
    else if(password.length>20) errors.password="Contraseña muy larga!";
    else if(password.includes(" ")) errors.password="La contraseña no debe contener espacios!"

    if(Object.keys(errors).length) throw Error(JSON.stringify(errors));

    const user = await User.create({name,email,password,role})
   
    return "Usuario creado con éxito";

}

const login =async({email, password})=>{
    const errors={}
    
    if(email=="") errors.email="Debe ingresar su email!";
    else if(!emailRegex.test(email)) errors.email="Debe ingresar un email válido!"

    if(password=="") errors.password="Debe ingresar una contraseña!";
    
    if(Object.keys(errors).length) throw Error(JSON.stringify(errors))

    const user=await User.findOne({where:{email}})
    if(!user||user.password!=password) {
        errors.password="email o contraseña incorrecto/a"
        errors.email="email o contraseña incorrecto/a"
        throw Error(JSON.stringify(errors)); 
    }
    const{password:pwd,...publicUser} = user;
    
    return publicUser;
}

module.exports={login,register}