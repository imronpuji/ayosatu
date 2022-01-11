const express = require('express')
const app = express()
const fs = require('fs')
const axios = require('axios')
const path = require('path')
const respond = require('express-respond')
var fileUpload = require('express-fileupload');
const {validateImage} = require("./validate");
const resizeImg = require('resize-image-buffer');
app.use(express.json())
app.use(respond);
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());


app.get('/', (req,res)=>{
	res.status(200).json("OK")
})
app.get('/api/image/:title/compress', (req, res)=>{
	res.sendFile(__dirname+'/public/image/compress/'+req.params.title)
})

app.get('/api/image/:title', (req, res)=>{
		res.sendFile(__dirname+'/public/image/erase/'+req.params.title)
})
app.post('/api/image',
	async (req, res)=>{
	
	const key = '46da1d017ffef4d762857504db9ddae834b62df2';
	if(req.body.key != key){
		return res.status(400).json([{
				response:{message:"Upss! Upload failed, your api key is wrong"},
				success:false,
			}])
	}

	if(req.files != null){
		console.log(req.headers)
		const image = req.files.image
		await validateImage(image.name, async(result)=>{
			if(result){
				// let uploadPath =await __dirname + '/public/' + image.name;
				let uploadPath =await __dirname + '/public/image/compress/';
				const buff = await resizeImg(image.data, {
				    width: 500,
				    height: null,
		 		});

		 		const randName = Math.random().toString(36).substr(2, 5);
	  			fs.writeFileSync(uploadPath+randName+path.extname(image.name), buff,  async (err)=>{
					if(err) return res.status(500).json([{
						response:{message:'Upss! Upload failed, Internal Server error'},
						success:false,
					}])
				});
				
				axios.get(`http://localhost:5000?url=http://${req.headers.host}/api/image/${randName+path.extname(image.name)}/compress`, {responseType: 'arraybuffer'}).then(result=>{
					const fullPath = path.join(__dirname,'/public/image/erase/'+randName+path.extname(image.name))
					fs.writeFile(fullPath, result.data, function(err) {
					    if(err) {
					        return res.status(500).json([{
								response:{message:'Upss! Upload failed, Internal Server error'},
								success:false,
							}])
					    }

					    fs.unlinkSync(path.join(__dirname,'/public/image/compress/'+randName+path.extname(image.name)))
					    return res.status(200).json([{
							response:{
								message:'yeaa! image converted successfully',
								url : `http://${req.headers.host}/api/image/${randName+path.extname(image.name)}`
							},
							success:true,
						}])
					})
				}).catch(err =>console.log('err'))
			} else {
				return res.status(400).json([{
					response:{message:'Upss! Upload failed, file must be an image'},
					success:false,
				}])
			}
		})
	} else {
		return res.status(400).json([{
				response:{message:"Upss! Upload failed, image file does not exist"},
				success:false,
			}])
	}
})

app.listen(3000)