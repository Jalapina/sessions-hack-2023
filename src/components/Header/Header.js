import React,{useState,useRef} from 'react';
import * as fcl from "@onflow/fcl"
import logo from "../../pages/Home/logo-white.png";
import padIntro from "../../pages/padIntro.png";
import "./header.css";
import createButton from "./plus-sign.png";
import profileButton from "./user.png";
import { Link } from 'react-router-dom';
import Modal from "../Modal/Modal.js";
import Register from "../../pages/Register/Register";
import Login from "../../pages/Login/Login";
import Create from "../../pages/Create/Create";
import { useCookies } from 'react-cookie';
import firebase from 'firebase/compat/app';
import {db} from '../../functions/firebase';
import { useAuthState, useAuthDispatch } from "../../components/Auth/auth-context";

fcl.config()
.put("accessNode.api", "https://rest-testnet.onflow.org")
.put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")

// fcl.config({  
//     "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
//     "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/testnet/authn"
//   })
//   .put("app.detail.title", "Sessions")
//   .put("app.detail.icon", "https://firebasestorage.googleapis.com/v0/b/sessions-e4f78.appspot.com/o/apple-touch-icon.png?alt=media&token=054b8262-9a89-49d2-97e7-19f8dc3ebac3")
//   .put("accessNode.api", "http://localhost:3000")
//   .put("accessNode.api", "https://sessions-e4f78.web.app")
//   .put("discovery.wallet", "http://localhost:8701/fcl/authn")
//   .put("accessNode.api", "https://access-testnet.onflow.org")
//   .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  
export default ({title,button}) => {
    
    const modalRef = useRef;
    const [cookies, setCookie] = useCookies(['user']);
    const [isOpen, setIsOpen] = useState(false);
    const [loginOrSignIn, setLoginOrSignIn]=useState(false);

    const { user: loggedUser, status, error } = useAuthState();
    const dispatch = useAuthDispatch();

    const createNewUser = (userAddress) =>{
        
            try {
                
              const response = db.firestore().collection('user')
              .add({
                  address:  userAddress,
                  createdAt : firebase.firestore.FieldValue.serverTimestamp(),
                  updatedAt : firebase.firestore.FieldValue.serverTimestamp()
                  }).then(()=>{
                    navigate(`/profile/`+userAddress);
                  })
        
            }catch(e){console.log(e)}
        
          }
        
          const userExist = async(userAddress) =>{
            console.log(userAddress)
            const getUser= db.firestore().collection('user');
            
            const userSnapshot = getUser.where("address","==",userAddress).get()
            .then(snapshot => {
        
              const userJSON = snapshot.docs.map(doc => ({
                    id: doc.id,
                  ...doc.data(),
                }));
        
              console.log("userJSON[0]",userJSON[0]);
              if (userJSON[0]==undefined){
                createNewUser(userAddress)
              }
              
            }).catch(err => {return console.error(err)});
              
          }
        
        
          const Auth =  async (currentUser) => {
            const user = userExist(currentUser.addr);    
            console.log("The Current User", currentUser)
        
            dispatch({
              status: "resolved",
              user: currentUser,
              error: null
            });
        
            setCookie('user',currentUser);
        
            console.log(currentUser);
          }
        
          const logIn =  async () => {
            // log in through Blocto
            fcl.authenticate();
            
            const unsubscribe = fcl.currentUser.subscribe(currentUser => {
              
                currentUser.addr ? Auth(currentUser) : "";
            
            });
            
          }

    return (
    <div className="header">
        <div className="artBackground">
        </div>
        
        <div className="logoWrapper">
            <h1 style={{fontFamily:"Zombie !important"}} >{title}</h1>
        </div>


        {button ?
            <div  className="buttonWrapepr">
            
                <div>
                    {cookies["user"] == undefined || cookies["user"] == "undefined"?(

                        <div style={{display:"inline-block"}}  onClick={() => logIn()}>
                            <img style={{width:"3em"}} src={profileButton}/>
                        </div>
                    ):
                     <div>
                        <Link to={"/profile/"+cookies["user"].addr}>
                            <img style={{width:"3em", marginRight:"50px"}} src={profileButton}/>
                        </Link>
                        <div style={{display:"inline-block"}}  onClick={() => setIsOpen(!isOpen)}>
                            <img className="createButton" src={createButton}/>
                        </div>
                    </div>
        
                    }
                </div>


                <Modal
                    isOpen={isOpen}
                    onHide={() => setIsOpen(!isOpen)}
                    headerCaption={cookies["user"] == undefined || cookies["user"] == "undefined" ? "Sing In":"Create Session"}
                >

                    {cookies["user"] == undefined || cookies["user"] == "undefined"?(

                        <Login/>
                        
                    ):(
                        <Create/>
                        )
                    }
                    
                </Modal>
            </div>
            :
            <div className="buttonWrapepr">
                <Link to="/">
                    <img style={{width:"100px"}} src={logo}/>
                </Link>
            </div>
        }
        </div>
    );

}
