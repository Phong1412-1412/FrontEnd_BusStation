import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth'
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { BASE_URL } from '../../constant/network';
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'

import "./style.css";
import axios from 'axios';

function CommentPage(props) {
  const [content, setContent] = useState('');
  const [comments, setComments] = useState([]);

  const [stompClient, setStompClient] = useState(null);
  const { accessToken, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const socket = new SockJS(`${BASE_URL}/comments`);
    const stompClient = Stomp.over(socket);
    stompClient.debug = null;

    // connect to ws
    stompClient.connect({
        Authorization: `Bearer ${accessToken}`
    }, () => {
        console.log('connected to WebSocket');
        setStompClient(stompClient)
        // Cancel temp order in storage if exist
    });

    return () => {
      if (stompClient && stompClient.connected) { // kiểm tra kết nối đã thiết lập và đang hoạt động
        stompClient.disconnect();
      }
    };
}, [accessToken, props])

  useEffect(() => {
    if(stompClient) {
       stompClient.subscribe(`/topic/comments/${props.data}`,
      (message) => {
        axios.get(`${BASE_URL}/api/v1/trips/${props.data}/comments`)
      .then((respone) => 
      { 

      setComments(respone.data)
    })
    .catch((err) => console.error(err));
    })
    }
  })

  

  useEffect(()=>  
  {
    axios.get(`${BASE_URL}/api/v1/trips/${props.data}/comments`)
    .then((respone) => 
    {

      setComments(respone.data)
    })
    .catch((err) => console.error(err));
  },[])

  const addComment = async (content) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/trips/${props.data}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          content
        }),
      });
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }
      // Handle success here
      console.log('Comment added successfully!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = (event) => {
      if(!user) {
        message.error("You need to login to continue select a seat!")
        navigate("/login")
        return;
      }
    event.preventDefault();
    addComment(content);
    setContent('');
  };

  return (
  <div>
      <div class="chat-header">
                <h1>COMMENTS THIS TRIP</h1>
      </div>
      <div className="chat-messages">
        {
          comments?.content?.map((comment) =>
            (
              <div className="message" key={comment.id}>
               <div class="avatar"></div>
                    <div class="message-content">
                      {
                        comment.user &&
                        (
                          comment.user?.roleId === "ADMIN"
                           ? (
                            <div class="user-name" style={{color: 'red'}}>{comment.user.fullName}: admin</div>
                           ) : comment.user?.roleId === "DRIVER" ?
                           (
                            <div class="user-name" style={{color: 'blue'}}>{comment.user.fullName}: driver</div>
                           )
                           : 
                           (
                            <div class="user-name">{comment.user.fullName}</div>
                           )
                        )

                      }
                        <div class="message-text">{comment.content}</div>
                        <div class="message-time">{comment.createdAt}</div>
                    </div>
              </div>
            )
          )
        }
       
      </div>

      <div className="chat-input">
        <form onSubmit={handleSubmit}>
          <label htmlFor="send">Nhập tin nhắn</label>
          <input
            type="text"
            id="send"
            name="send"
            placeholder="Your content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <input type="submit" value="Send" />
        </form> 
      </div>
    </div>
  );
}

export default CommentPage;
