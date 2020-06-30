const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');

let app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(cors());

// cloudinary
const cloudinary = require('cloudinary');

async function uploadImg(a) {
    let url = ''
    return await cloudinary.v2.uploader.unsigned_upload(a, "ufcftkmb",
        function(error, result) {
            url = result.secure_url
            return url;
        });

}


// Back4App
const Parse = require('parse/node');
Parse.serverURL = 'https://parseapi.back4app.com'; // This is your Server URL
Parse.initialize();
const franz = Parse.Object.extend('franz');
const atas = Parse.Object.extend('atas');
const oferta1 = Parse.Object.extend('oferta');
const oferta_v = Parse.Object.extend('oferta_verificada');
const usuario_v = Parse.Object.extend('usuario_verificado');



const multer = require("multer");
let upload = multer();

// Esta e a rota a ser usada pelo 'axios': http://localhost:3000/image-upload.
// O campo 'fileimage' sera a chave que o multer ira procurar pelo arquivo de imagem.
app.post("/image-upload", upload.single('fileimage'), (req, res) => {
    if (!req.body)
        res.status(505).send('ERRO CADASTRA SEM BODY');

    axios.get('https://parseapi.back4app.com/classes/franz', {
            headers: headerb4
        })
        .then(a => {
            // let user = a.data.results.filter(b=>b.login === req.body.oferta.login)
            // if(typeof user == 'undefined' || user.senha !== req.body.oferta.senha)
            // 	a.status(505).send('login not exist')

            binaryData = new Buffer(req.file.buffer, 'base64').toString('binary');

            require("fs").writeFile("out.png", binaryData, "binary", function(err) {
                // console.log(err); // writes out file without error, but it's not a valid image
            });

            uploadImg("out.png")
                .then(url_img => {
                    obj = JSON.parse(req.body.oferta)
                    const Back4App1 = new oferta1();

                    let dono = obj.dono //crypto.createHash('sha256').update(obj.login, 'utf8').digest('hex').slice(0,16);
                    Back4App1.set('custo', parseInt(obj.preco));
                    Back4App1.set('descricao', obj.descricao);
                    Back4App1.set('tipo', obj.tipo); ///AQUI
                    Back4App1.set('dono', dono);
                    Back4App1.set('validade', obj.validade);
                    Back4App1.set('img', url_img.secure_url);
                    Back4App1.set('titulo', obj.titulo);

                    Back4App1.save().then(
                        (result) => {
                            if (typeof document !== 'undefined');
                            console.error('SUCCESS');
                        },
                        (error) => {
                            if (typeof document !== 'undefined');
                            console.error('ERRO NO BACK4ALL ', error);
                        }
                    );

                    res.status(200).json({
                        message: "success!"
                    });
                })
        })
});

// ROUTES
app
 .get('/aloha', (req, res) => {
     axios.get('https://parseapi.back4app.com/classes/usuario_verificado', {
             headers: headerb4
         })
         .then(ab => {
             let obj = ab.data.results.filter(b => b.user_id == req.query.user_id)[0]
             res.json(obj)
         })
 })

// 2 ROTA LOGIN
.post('/login', (req, res) => {

        return axios.get('https://parseapi.back4app.com/classes/usuario_verificado', {
                headers: headerb4
            })
            .then(a => {
                let user = a.data.results.filter(b => b.login === req.body.login)[0]
                if (typeof user == 'undefined')
                    res.status(500).json({
                        message: 'Não existe este login'
                    });

                if (user.senha === req.body.senha) {
                    var token = jwt.sign({
                        "user": user.user_id
                    }, 'BaNaNaNiNJa', {
                        expiresIn: 300 // expires in 10min
                    });
                    console.log(token)
                    res.json({
                        auth: true,
                        token: token,
                        user_id: user.user_id
                    });
                } else
                    res.status(500).json({
                        message: 'Login inválido!'
                    });
            })
    })
    // 3 ROTA LOG OUT
    // .post('/logout', function(req, res) {
    //     res.json({ auth: false, token: null });
    // })
    // 4 ROTA COM MIDLEWARE 
    // .get('/clientes', verifyJWT, (req, res, next) => { 
    //     console.log("Retornou todos clientes!");
    //     res.json([{id:1,nome:'luiz'}]);
    // })
    // 5 ROTA CADASTRO
  

    .get('/pinlist',(req,res)=>{
			axios.get("https://api.pinata.cloud/data/pinList?status=pinned", {
         headers: pinata_header
      	}).then(a=>{
	  			axios.get('https://gateway.pinata.cloud/ipfs/'+a.data.rows[0].ipfs_pin_hash).then(b=>
	  				res.send(b.data))
      	})
    	})
    .post('/cadastro', upload.single('fileimage'),(req, res) => {
        let file_up = 'images/avatar.png'
        let usuario = JSON.parse(req.body.form)

        if(typeof req.file != 'undefined'){
				binaryData = new Buffer.from(req.file.buffer, 'base64').toString('binary');

            require("fs").writeFile("out1.png", binaryData, "binary", function(err) {
                console.log(err); // writes out file without error, but it's not a valid image
            });
            file_up = "out1.png"
        }
        		uploadImg(file_up).then(url_img=>{

        			try{

			        const Back4App = new franz();

			        let end = usuario.pais + ':' + usuario.estado + ',' + usuario.cidade
		           Back4App.set('img', url_img.secure_url);
			        Back4App.set('login', usuario.login);
			        Back4App.set('email', usuario.email);
			        Back4App.set('cpf', usuario.cpf);
			        Back4App.set('endereco', end);

			        if (typeof usuario.lat != 'undefined')
			            Back4App.set('coord', 'lat:' + usuario.lat + ',long:' + usuario.lon);

			        Back4App.set('estado', usuario.estado);
			        Back4App.set('telefone', usuario.telefone);
			        Back4App.set('descricao', usuario.message);
			        Back4App.set('moedas', 0);
			        Back4App.set('senha', usuario.senha);

			        usuario.id = crypto.createHash('sha256').update(usuario.login, 'utf8').digest('hex').slice(0, 16);
			        Back4App.set('user_id', usuario.id);

			        Back4App.save().then(
			            (result) => {
			                res.json({
			                    user_id: usuario.id
			                });
			            },
			            (error) => {
			                res.status(505)
			            }
			        );
        			}
        			catch{
			         
			         res.status(505)

        			}

        })

        // })

    })
    .get('/verifica',(req,res)=>{
    	axios.get("https://api.pinata.cloud/data/pinList?status=pinned", {
         headers: pinata_header
      	}).then(a=>{
      		if(a.data.rows[0].date_pinned.split('T')[0] == (new Date()).toISOString().split('T')[0])
      			res.send('data de hoje já teve uma verificação, aguarde amanha')
		    	else{
					verificaDia()
					res.end()
		    	}
    		})
      })
    .listen(PORT, () => console.log(`Listening on ${PORT}`))


// FUNCTIONS
function verifyJWT(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({
        auth: false,
        message: 'No token provided.'
    });

    jwt.verify(token, 'BaNaNaNiNJa', function(err, decoded) {
        if (err) return res.status(500).json({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        // se tudo estiver ok, salva no request para uso posterior
        req.userId = decoded.id;
        next();
    });
}

// function verifyLogin(login){
// 	const query = new Parse.Query(franz);
// 	query.equalTo("login", 'luis');
// 	query.find().then((results) => {
// 	  if (typeof document !== 'undefined') document.write(`franz found: ${JSON.stringify(results)}`);
// 		  console.log(results[0]);
// 	}, (error) => {
// 	  if (typeof document !== 'undefined') document.write(`Error while fetching franz: ${JSON.stringify(error)}`);
// 	  console.error('Error while fetching franz', error);
// 	});
// }

	// IPFS Pinata
async function pinataPost(userForm) {
    resp = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS',
        userForm, {
            maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: pinata_header
        })
    return resp
}

// distancia em km
function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}


async function verificaDia(){
	let ata = {}
	await axios.get('https://parseapi.back4app.com/classes/franz', {
	       headers: headerb4
	   })
	   .then((ab) => {

	   	try
	   	{
		      const Back4App1 = new usuario_v();
		   	ata.users = ab.data.results
		   	ab.data.results.map(obj=>{


	           Back4App1.set('login', obj.login);
	           Back4App1.set('email', obj.email);
	           Back4App1.set('cpf', obj.cpf);
	           Back4App1.set('img', obj.img);
	           Back4App1.set('endereco', obj.endereco);
	           Back4App1.set('coord', obj.coord);
	           Back4App1.set('estado', obj.estado);
	           Back4App1.set('descricao', obj.descricao);
	           Back4App1.set('senha', obj.senha);
	           Back4App1.set('user_id', obj.user_id);

	           Back4App1.save().then(
	               (result) => { 
	                   if (typeof document !== 'undefined');
	                   console.error('SUCCESS');
	               },
	               (error) => {
	                   if (typeof document !== 'undefined'); 
	                   console.error('ERRO NO BACK4ALL ', error);
	               }
	           );
		   	})
	   	}
	   	catch (err)
	   	{
	   		console.log('Ocorreu um erro durante cadastro de usuarios verificados', err)
	   		return
	   	}
         try
         {
	         // DELETA OS USUARIOS TEMPORARIOS
	    		let franz = Parse.Object.extend('franz');
					
				const query = new Parse.Query(franz);
				ab.data.results.map(usuario_del => {
					query.get(usuario_del.objectId).then((object) => 
					{
					  	object.destroy().then((response) => 
					  	{
					   	console.log('Deleted usuarios', response);
					  	}, (error) => 
					  	{
					   	console.error('Error while deleting franz', error);
						});
					})
				});
			}
			catch (err)
	   	{
	   		console.log('Ocorreu um erro durante remoção de usuarios nao verificados', err)
	   		return
	   	}

      })
      await axios.get('https://parseapi.back4app.com/classes/oferta', {
	       headers: headerb4
	   })
	   .then((ab) => {
	   	try
	   	{
		      const Back4App1 = new oferta_v();  
		   	ata.ofertas= ab.data.results
		   	ab.data.results.map(obj=>{

	           Back4App1.set('custo', obj.custo);
	           Back4App1.set('tipo', obj.tipo);
	           Back4App1.set('dono', obj.dono);
	           Back4App1.set('validade', obj.validade);
	           Back4App1.set('img', obj.img);
	           Back4App1.set('titulo', obj.titulo);
	           Back4App1.set('descricao', obj.descricao);

	           Back4App1.save().then(
	               (result) => {
	                   if (typeof document !== 'undefined');
	                   console.error('SUCCESS');
	               },
	               (error) => {
	                   if (typeof document !== 'undefined');
	                   console.error('ERRO NO BACK4ALL ', error);
	               }
	           );
		   	})

	         // DELETA OFERTAS TEMPORARIOS
	         let oferta_t = Parse.Object.extend('oferta');
				const query = new Parse.Query(oferta_t);
				ab.data.results.map(oferta_del => {
					query.get(oferta_del.objectId).then((object) => 
					{
					  	object.destroy().then((response) => 
					  	{
					   	console.log('Deleted usuarios', response);
					  	}, (error) => 
					  	{
					   	console.error('Error while deleting oferta', error);
						});
					})
				});
	         // FIM 
         }
			catch (err)
	   	{
	   		console.log('Ocorreu um erro durante a criação de ofertas verificadas', err)
	   		return
	   	}

      })
      // console.log(ata)

	  	// LISTA MUDANÇAS NO BANCO DE DADOS -> VERIFICA// 
      let ata_pinata = []
      ata.users.map(user=>{
	      ata_pinata.push({
	      	tipo:'cadastro_usuario',
	      	payload: {
		      	user_id: user.user_id,
	      		login: user.login,
	      		email: user.email,
	      		cpf: user.cpf.slice(0,2)+ user.cpf.slice(2,6).replace(/[0-9]/g,'x')+user.cpf.slice(6,9),
	      	}
	      })
      })
      ata.ofertas.map(oferta=>{ 
	      ata_pinata.push({
	      	tipo:'cadastro_oferta',
	      	payload: {
	      		user_id: oferta.dono,
	      		preco: oferta.custo,
	      		titulo: oferta.titulo,
	      		descricao: oferta.descricao,
	      		tipo: oferta.tipo,
	      		validade: oferta.validade,
	      	}
	      })
      })

	  	// LISTA TODO BANCO DE DADOS VERIFICADO -> CONFERE// 
	  	let usuarios_ativos = []
      await axios.get('https://parseapi.back4app.com/classes/usuario_verificado', {
	       headers: headerb4
	   })
	   .then((ab) => {ab.data.results.map(us=>usuarios_ativos.push({user:us.user_id,login:us.login,img:us.img}))})

	  	let lista_de_ofertas = []
	   await axios.get('https://parseapi.back4app.com/classes/oferta_verificada', {
	       headers: headerb4
	   })
	   .then((ab) => {
	   	usuarios_ativos.map(us=>{ 
	   		lista_de_ofertas.push({ 
	   			login:us.login,   
	   			img:us.img,   
	   			user:us.user,   
	   			ofertas: ab.data.results
	   			.filter(u => { return u.dono == us.user })
	   			.map(oferta=> {
	   				return {
				      		tipo: oferta.tipo,
				      		titulo: oferta.titulo,
				      		descricao: oferta.descricao,
				      		preco: oferta.custo,
				      		validade: oferta.validade,
				      		imagem: oferta.img,
				      }
	   			}) 
		      })
	   	})
	   })

	   lista_de_ofertas.map(f=> f.creditos = f.ofertas.reduce((a,b)=>a+b.preco,0))

      await axios.get('https://parseapi.back4app.com/classes/usuario_verificado', {
	       headers: headerb4
	   })
	   .then((ab) => {

			   lista_de_ofertas.map(us => {

					const usuario_verificado = Parse.Object.extend('usuario_verificado');
					const query = new Parse.Query(usuario_verificado);

					let r = ab.data.results.filter(ar=> us.user == ar.user_id)[0].objectId
					query.get(r).then((object) => {
		   		 object.set('moedas', us.creditos);
					  object.save().then((response) => {
					    console.log('Updated usuario_verificado', response);
					  }, (error) => {
					    console.error('Error while updating usuario_verificado', error);
					  });
					});
	   	})
	   })



	  	// RESPONSE 	// 
		let obj_res = {
			data_verificacao: (new Date()).toGMTString(), 
			transacoes:ata_pinata,
			ofertas:lista_de_ofertas
		}
		pinataPost(obj_res).then(a=>{
		const ata = new atas();

	     ata.set('ipfs', a.data.IpfsHash);
	     ata.save().then(
	         (result) => {
	             console.error('SUCCESS');
	         },
	         (error) => {
	             console.error('ERRO NO BACK4ALL ', error);
	         }
	     );
		});

}

     
