const PORT = process.env.PORT || 3001;

const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const bodyparse = require('body-parser')
var url = require('url');

const router = express.Router()
const app = express();

app.get('/prueba', (req, respons) =>{
    respons.send('<h1>HOLA MUNDO</h1>')
})

app.get('/especialistas', (req, response) => {
    const queryObj = url.parse(req.url, true).query;
    const esp = (queryObj.q == undefined ? "psicologo" : queryObj.q);
    const ubicacion = queryObj.loc == undefined ? "monterrey" : queryObj.loc;
    const pagina = queryObj.pag == undefined ? 1 : queryObj.pag;
    const _URL = "https://www.doctoralia.com.mx/buscar?q="+esp+"&loc="+ubicacion+"&page="+pagina;
    console.log(_URL)
    
    const especialistas = [];
    const especialistasAll = [];
    axios(_URL)
    .then((respose) => {
      const html = respose.data;
      const $ = cheerio.load(html);

      $(".has-cal-active", html).each(function () {
        let nombre = "";
        let nombre2 = "";
        let direccion = "";
        let direccion2 = "";
        let telefono = "";
        let urlEspecialista = "";

        urlEspecialista = $(this).find("div").attr("data-doctor-url");
        $(".card-body", this).each(function () {
          $(".dp-doctor-card", this).each(function () {
            $(".media", this).each(function () {
              // console.log($(this).find('.pr-1 a').attr('href'))
            });
          });
        });

        if (urlEspecialista != "") {
            axios(urlEspecialista).then((respose) => {
            const html = respose.data;
            const $ = cheerio.load(html);
            let num = 1;
            let codigo = 0;
            const direcciones = [];
            const telefonos = [];

            $(".wrapper", html).each(function () {
              $(".unified-doctor-content-column", html).each(function () {
                $(".card-shadow-1", this).each(function () {
                  $(".unified-doctor-header", this).each(function () {
                    nombre2 = $(this)
                      .find("chat-open-in-app-modal-app")
                      .attr("profile-name");
                    nombre2 = nombre2.trim();
                  });
                });

                $(".unified-doctor-content", this).each(function () {
                  $("#profile-info", this).each(function () {
                    $(".card-body", this).each(function () {
                      $(".tab-content", this).each(function () {
                        $(".tab-pane", this).each(function () {
                          $(".media", this).each(function () {
                            $(".media-body", this).each(function () {
                              $(".m-0", this).each(function () {
                                // codigo = $(this).find('span').attr('content')
                                // Validar si el codigo postal contiene en #64
                                // console.log(codigo)
                                $(".text-body", this).each(function () {
                                  direccion2 = $(this).find("span, a").text();
                                  // console.log("Direccion:::: " + direccion2)
                                  direcciones.push({ direccion2 });
                                });
                              });
                            });
                          });

                          $(".media", this).each(function () {
                            $(".media-body", this).each(function () {
                              $(".modal-content", this).each(function () {
                                $(".card-body", this).each(function () {
                                  $(".d-flex", this).each(function () {
                                    telefono = $(this).find("a").attr("href");
                                    telefonos.push({ telefono, direccion2 });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
              const data = {
                nombre: nombre2,
                // "direcciones" : direcciones,
                datosContacto: telefonos,
              };
                // console.log(data);
                // console.log(typeof especialistasAll)
                especialistasAll.push(JSON.parse(JSON.stringify(data)));
                direcciones.splice(0, direcciones.length);
                telefonos.splice(0, telefonos.length);
            });
          });
        }

        $(".dp-doctor-card", this).each(function () {
          $(".media-body", this).each(function () {
            nombre = $(this).find("h3 a span").text();
            nombre = nombre.trim();
          });
        });

        $(".doctor-card-address", this).each(function () {
          $(".overflow-hidden", this).each(function () {
            direccion = $(this).find("p span").text();
          });
        });

        especialistas.push({
          nombre,
          direccion,
        });
      });
      response.send(especialistas)
    //   console.log(especialistas)
    //   console.log(especialistasAll)
    })
    .catch((error) => console.log(error));

})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
