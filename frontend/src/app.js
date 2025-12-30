import React, { useState, useEffect } from 'react';
import "./Project.css"

function Main(){

    const [dishes, setDishes] = useState([]);
    const [newDish, setNewDish] = useState({dish:"",price:"",description:"",  image_url: ""});
    const [editingDishId, setEditingDishId] = useState(null);
    const [editedDish, setEditedDish] = useState({ dish: "", price: "", description: "", image_url: ""  });
    const [searchDishName, setSearchDishName] = useState("");
    const [choose, setChoose]= useState("");

    //הצגת כל המנות 
   const fetchAllDishes = () => {
  fetch(`http://localhost:2000/dish`, { method: "GET",credentials:"include"})
    .then((res) => res.json())
    .then((data) => {
      setDishes(data);
    })
    .catch((err) => console.error("Error fetching data:", err));
};
useEffect(() => {
  fetchAllDishes();
}, []);

    //מחיקת מנה 
   const deletDish = (dish_id) => {
    fetch(`http://localhost:2000/deletDish/${dish_id}`, {
      method: "DELETE",
      credentials:"include"
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data);
        if (data == "Deleted") {
          setDishes(dishes.filter((dish) => dish.id !== dish_id));
        }
      })
      .catch((err) => console.error("Error: ", err));
  };
  
  //הוספת מנה 
   const handleAddDish = () => {
    const dishToSend = {
      ...newDish
    };

    console.log("Sending dish:", dishToSend);

    fetch(`http://localhost:2000/addDish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dishToSend),
      credentials:"include"
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.message === "Dish added successfully") {
          setDishes([...dishes, data.newDish]);
          setNewDish({ dish: "", price: "", description: "", image_url: ""  }); // איפוס השדות
        }
      })
      .catch((err) => console.error("Error:", err));
  };
  

  //עדכון מנה 
 const updateDish = (dish) => {
  fetch(`http://localhost:2000/updateDish/${dish.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dish: dish.dish,
      price: dish.price,
      description: dish.description,
      restaurant_id: dish.restaurant_id,
      image_url: dish.image_url,  // הוסף את זה
    }),
    credentials:"include"
  })
    .then((res) => {
      if (res.ok) {
        alert("Dish updated successfully");
      } else {
        throw new Error("Failed to update dish");
      }
    })
    .catch((err) => console.error("Error:", err));
};

const startEditing = (dish) => {
  setEditingDishId(dish.id);
  setEditedDish({ 
    dish: dish.dish, 
    price: dish.price, 
    description: dish.description,
    image_url: dish.image_url || ""  // אתחול ערך התמונה
  });
};

const cancelEditing = () => {
  setEditingDishId(null);
  setEditedDish({ dish: "", price: "", description: "" });
};

const saveUpdatedDish = (dish) => {
  const updatedDish = {
    ...dish,
    dish: editedDish.dish,
    price: editedDish.price,
    description: editedDish.description,
    image_url: editedDish.image_url,  // הוסף את זה
  };

  updateDish(updatedDish);
  // עדכון ברשימה המקומית
  setDishes(dishes.map(d => d.id === dish.id ? updatedDish : d));
  cancelEditing();
};

 //חיפוש מנה
    const searchDish = () => {
  if (!searchDishName.trim()) {
    alert("אנא הזן שם מנה לחיפוש");
    return;
  }

  fetch(`http://localhost:2000/searchDish`, {
    method: "POST",credentials:"include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dish: searchDishName }),
    credentials:"include"
  })
    .then((res) => res.json())
    .then((data) => {
      if (typeof data === "string") {
        alert(data); // למשל "No dish found"

      } else {
        setDishes(data); // להציג את התוצאות שנמצאו
      }
    })
    .catch((err) => console.error("Error fetching dish:", err));
};

    

  const render_dishes = dishes.map((i)=><li key={i.id}>    {i.dish} by {i.price} - {i.description} <button onClick={()=>deletDish(i.id)}>מחק</button>   </li>)


 return (
  <div>
    <h3>חפש מנה:</h3>
    <input
      type="text"
      placeholder="הכנס שם מנה לחיפוש"
      value={searchDishName}
      onChange={(e) => setSearchDishName(e.target.value)}
    />
    <button onClick={searchDish}>חפש</button>
    <button onClick={fetchAllDishes}>הצג את כל המנות</button>

    <div className="dish-grid">
      {dishes.map((i) => (
        <div className="dish-card" key={i.id}>
          {editingDishId === i.id ? (
            <>
              <input
                value={editedDish.dish}
                onChange={(e) => setEditedDish({ ...editedDish, dish: e.target.value })}
              />
              <input
                value={editedDish.price}
                onChange={(e) => setEditedDish({ ...editedDish, price: e.target.value })}
              />
              <input
                value={editedDish.description}
                onChange={(e) => setEditedDish({ ...editedDish, description: e.target.value })}
              />
              <input
                value={editedDish.image_url}
                placeholder="Image URL"
                onChange={(e) => setEditedDish({ ...editedDish, image_url: e.target.value })}
              />
              <button onClick={() => saveUpdatedDish(i)}>שמור</button>
              <button onClick={cancelEditing}>בטל</button>
            </>
          ) : (
            <>
              <h2 className="dish-title">{i.dish}</h2>

              {(i.image_url && i.image_url.startsWith("http")) ? (
                <img src={i.image_url} alt={i.dish} className="dish-image" />
              ) : (
                <img
                  src="https://via.placeholder.com/200x150?text=No+Image"
                  alt="No"
                  className="dish-image"
                />
              )}

              <h4 className="dish-label">תיאור:</h4>
              <p className="dish-text">{i.description}</p>

              <h4 className="dish-label">מחיר:</h4>
              <p className="dish-price">{i.price} ₪</p>

              <div className="dish-buttons">
                <button onClick={() => deletDish(i.id)}>מחק</button>
                <button onClick={() => startEditing(i)}>ערוך</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>

    <h3>הוספת מנה חדשה:</h3>
    <input
      placeholder="Dish name"
      value={newDish.dish}
      onChange={(e) => setNewDish({ ...newDish, dish: e.target.value })}
    />
    <input
      placeholder="Dish price"
      value={newDish.price}
      onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
    />
    <input
      placeholder="Dish description"
      value={newDish.description}
      onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
    />
    <input
      placeholder="Image URL"
      value={newDish.image_url}
      onChange={(e) => setNewDish({ ...newDish, image_url: e.target.value })}
    />
    <button onClick={handleAddDish}>שמור מנה חדשה</button>
  </div>
);
}

  function Register({setUser}){
    
    const [userInfo, setUserInfo] = useState({username:"",password:""})

    const handleRegister = async () =>{
      try{
        const res = await fetch("http://localhost:2000/register",{
          method: "POST",
          headers:{"Content-Type": "application/json"},
          body: JSON.stringify(userInfo),
          credentials:"include"
        });
      if(!res.ok){
        const err = await res.json();
        throw new Error(err.message);
      }
      const data = await res.json();
      setUser(data.user);
      alert("user registered successfully")
      }catch(err){
         if (err.message === "שם משתמש תפוס") {
        alert(err.message);
      } else {
        console.error("שגיאה:", err);
      }
      }
    };


    return (
      <div>
          <h1>Register</h1>
          <input type="text" placeholder="username" onChange={(e) => setUserInfo({...userInfo, username:e.target.value})}/>
          <input type="password" placeholder="password" onChange={(e) => setUserInfo({...userInfo, password:e.target.value})} />
          <button onClick={handleRegister}>Register</button>
      </div>
  )
  }



  function Login({setUser}){

    const [userInfo, setUserInfo] = useState({username:"",password:""})

     const handleLogin = async () =>{
      try{
        const res = await fetch("http://localhost:2000/login",{
          method: "POST",
          headers:{"Content-Type": "application/json"},
          body: JSON.stringify(userInfo),
          credentials: "include"
        });
      if(!res.ok){
        const err = await res.json();
        throw new Error(err.message);
      }
      const data = await res.json();
      setUser(data.user);
      }catch(err){
         if (err.message ==="שם משתמש או סיסמה לא נכונים") {
        alert(err.message);
      } else {
        console.error("שגיאה:", err);
      }
      }
    };


    return (
     <div>
          <h1>Login</h1>
          <input type="text" placeholder="username" onChange={(e) => setUserInfo({...userInfo, username:e.target.value})}/>
          <input type="password" placeholder="password" onChange={(e) => setUserInfo({...userInfo, password:e.target.value})} />
          <button onClick={handleLogin}>Login</button>
      </div>
    )
  }


  function Auth() {
  const [logOrReg, setLogOrReg] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(()=>{
    fetch("http://localhost:2000/me",{credentials:"include"})
    .then((res)=> res.json())
    .then((data)=>{
      if(data.loggedIn){
        setUser(data.user);
      }
    })
    .catch(()=>{});
  },[]);

  const handleLogout = () => {
      fetch("http://localhost:2000/logout", {
      method: "POST",
      credentials: "include",
  })
  .then(()=>{
    setUser(null); // מחזיר אותך למסך התחברות
    setLogOrReg(null);
  })

  .catch((error) =>{
    console.error("שגיאה בהתנתקות:", error);
  })
};

  return (
    <div>
      {user ? (
        <div>
          <h1>hello {user.restaurant}</h1>
          <button className="logout-button" onClick={handleLogout}>Log Out</button>
          <Main />
        </div>
      ) : (
        <div>
          <button onClick={() => setLogOrReg("Log In")}>Log In</button>
          <button onClick={() => setLogOrReg("Register")}>Register</button>

          {logOrReg === "Log In" && <Login setUser={setUser} />}
          {logOrReg === "Register" && <Register setUser={setUser} />}
        </div>
      )}
    </div>
  );
}



export default Auth;