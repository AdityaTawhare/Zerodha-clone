import React from 'react';

function Team() {
    return ( 
        <div className='container'>
            <div className='row p-3 mt-5 border-top'>
                <h1 className='text-center'>People</h1>
            </div>
            
            <div className='row p-3 text-muted' style={{lineHeight: "1.8", fontSize: "1.2em"}}>
                <div className='col-6 p-5 text-center'>
                    <img src="media/images/Adityazerodha.jpeg" alt="Aditya" style={{width: "40%", borderRadius: "50%"}}/>
                    <h4 className="mt-5">Aditya Tawhare</h4>             
                </div>
                <div className='col-6'>
                      <p>Aditya bootstrapped and founded Zerodha in 2026 to overcome the hurdles he faced during his decade long stint as a trader.</p>
                      <p> Today, Zerodha has changed the landscape of Indian broking industry.</p>
                      <p>Playing Cricket is his zen.</p>
                      <p>Connect on <a href="">HomePage</a> / <a href="">TradingQnA</a> / <a href="">Twitter</a></p>
                </div>
            </div>
        </div> 
     );
}

export default Team;