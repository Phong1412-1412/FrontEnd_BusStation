import React, { useEffect, useState, useRef} from 'react';
import { useAuth } from '../../contexts/auth'
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { BASE_URL } from '../../constant/network';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV,faReply,faCopy,faTimes } from '@fortawesome/free-solid-svg-icons';

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

  const addComment = async (content, parentId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/trips/${props.data}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          content,
          parentId
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
        message.error("You need to login to continue comment!")
        navigate("/login")
        return;
      }
    event.preventDefault();
    addComment(content, parentId);
    setContent('');
    setParentId(null);
    setReplyContent('');
  };

  //rely comment

  const title = "Comment for the trip from "+props.trip.provinceStart+ " to " +props.trip.provinceEnd;

  const [showOptions, setShowOptions] = useState(false);

  const [replyContent, setReplyContent] = useState('');
  const [parentId, setParentId] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const messageInputRef = useRef(null);
  
  const handleOptionsClick = (commentId) => {
    setShowOptions((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  const handleReplyClick = (content, commentId) => {
    messageInputRef.current.focus();

    setReplyContent(content);
    setParentId(commentId);
    const comment = comments?.content.find((comment) => comment.commentId === commentId);
    setSelectedComment(comment);

    setShowOptions(!showOptions);
  };

  const handleCopyClick = (content) => {
    navigator.clipboard.writeText(content);
    setShowOptions(!showOptions);
  };

  return (
      <div>
          <div className="chat-header">
              <h1>{title}</h1>
          </div>

          <div className="chat-messages">
              {comments?.content?.map((comment) => {
                const userRole = comment.user?.roleId;
                const nameColor = userRole === 'ADMIN' ? 'red' : userRole === 'DRIVER' ? 'blue' : 'black';
                const roleName = userRole === 'ADMIN' ? ' : admin' : userRole === 'DRIVER' ? ' : driver' : '';
                return (
                  <div className="message left" key={comment.commentId}>
                    <div className={`message-content ${comment.relyComment ? 'reply' : 'comment'}`}>
                        <div className="user-name" style={{ color: nameColor }}>
                          {comment.user?.fullName}{roleName}
                        </div>
                        {comment.relyComment && (
                          <div className="reply-content">
                            Rely to {comment.relyComment.user?.fullName}: {comment.relyComment.content}
                          </div>
                        )}
                        <div className="message-text">{comment.content}</div>
                        <div className="message-time">{comment.createdAt}</div>
                        <div className="options-icon" onClick={() => handleOptionsClick(comment.commentId)}>
                            <FontAwesomeIcon icon={faEllipsisV} />
                        </div>
                        {showOptions[comment.commentId] && (
                          <div className="options-menu">
                            <div className="option" onClick={() => handleReplyClick(comment.content, comment.commentId)}>
                              <FontAwesomeIcon icon={faReply} /> Rely
                            </div>
                            <div className="option" onClick={() => handleCopyClick(comment.content)}>
                              <FontAwesomeIcon icon={faCopy} /> Coppy message
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
          </div>
          <div class="chat-input">
              {replyContent && (
                <div className="reply-content-form">
                  Rely to {selectedComment.user?.fullName}: {replyContent}
                  <div className="close-icon" onClick={() => {
                    setReplyContent(null);
                    setParentId(null);
                  }}>
                    <FontAwesomeIcon icon={faTimes} />
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                  <input type="hidden" name="parentId" value={parentId} />
                  <input
                    ref={messageInputRef}
                    type="text"
                    id="send"
                    name="send"
                    placeholder="Enter your message..."
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
