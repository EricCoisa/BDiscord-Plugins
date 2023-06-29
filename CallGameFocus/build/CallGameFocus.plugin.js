/**
 * @name CallGameFocus
 * @version 1.2
 * @author Coisa
 * @authorLink https://github.com/EricCoisa
 * @description Reduzir o audio dos players que não estão no mesmo jogo
 * @website https://github.com/EricCoisa/BDiscord-Plugins
 * @source https://github.com/EricCoisa/BDiscord-Plugins/CallGameFocus/build/CallGameFocus.plugin.js
 * 
 */

const VolumeMinimo = 5; //Volume Reduzido
const VolumeNormal = 90; //Volume Padrão
//## CONTROLE DE VOLUME INDIVIDUAL ##//
const ForcarVolume = {Nekotina:10, Coisa:200};


///ALTERA O AUDIO START
const find = (filter, { resolve = true, entries = false } = {}) => BdApi.Webpack.getModule(filter, {
    defaultExport: resolve,
    searchExports: entries
});

const negocio = (...keys) => {
    return (target) => target instanceof Object && keys.every((key) => key in target);
};
const byKeys = (keys, options) => find(negocio(...keys), options);
const MediaEngineActions = /* @__PURE__ */ byKeys(["setLocalVolume"]);
///ALTERA O AUDIO END



module.exports = class CPlus {
    constructor(meta) {    
        this.ListOnCall = []; //Lista de Funções Ao entrar em call
        this.ListOffCall = []; //Lista de Funções Ao Sair da call
        this.observer;
        this.botao;

        this.mutado = false;

        
    }

    start() {

        setTimeout(() => {
            this.RemoverBtnExtra();
        }, 100);
    
        setTimeout(() => {
              //Criar Botao
      this.botao = document.createElement("button");
      this.botao.textContent = "M";
      this.botao.addEventListener("click", () => {this.AutoMude()});
      this.botao.classList.add('botaoCPlug', 'button-12Fmur', 'enabled-9OeuTA', 'button-ejjZWC', 'lookBlank-FgPMy6', 'colorBrand-2M3O3N', 'grow-2T4nbg', 'button-12Fmur')

        const root = document.getElementById("app-mount");
        root.append(this.botao);
        this.Ocultar(this.botao);

        this.AddOnCall(()=>{
            const areaUsuario = document.querySelector(".container-1zzFcN >div.flex-2S1XBF >div.flex-2S1XBF");
            areaUsuario.prepend(this.botao);
            this.Mostrar(this.botao);

            BdApi.onRemoved(this.botao, () => {
                areaUsuario.prepend(this.botao);
            });
        })

        this.AddOffCall(()=>{
            root.append(this.botao);
            this.Ocultar(this.botao);
            //this.Desmute();
        })

        
        this.CPlusInit();  

        this.VerificarOnCallAoIniciar();
        }, 100);
    
    }

    stop() {
        
        //this.Desmute();
        this.ListOnCall.splice(0,this.ListOnCall.length)
        this.ListOffCall.splice(0,this.ListOffCall.length)
        
        this.botao.remove();
        this.RemoverBtnExtra();
        
        delete this;
    }

    RemoverBtnExtra(){
        //Remove btnAntigo caso houver

        const elements = document.querySelectorAll('button.botaoCPlug');
            elements.forEach(element => {
            const root = document.getElementById("app-mount");
            root.append(element);
            element.remove();
            });
        }

       
    
    
    VerificarOnCallAoIniciar(){
        var painelCall =  document.querySelector("div.container-1zzFcN");
        if(painelCall != null){
            this.OnCall();
        }return false
    }

    AutoMude() {
        if(this.VerificarDiscord() == false){return}

        if(this.mutado == false){
            this.Mute();
        }else{
            this.Desmute();
        }
        
    }

    Mute(){
        if(this.MutarOutrosJogadores() == true){
        this.botao.style.backgroundColor = "var(--yellow-400)";
        this.botao.style.color = "var(--white-500)";
        
        this.mutado = true;
        }
    }

    Desmute(){
        this.botao.style.backgroundColor = "";
        this.botao.style.color = "";
        this.DesMutarOutrosJogadores();
        this.mutado = false;
    }
    
    DesMutarOutrosJogadores(){
        var ListaJogadoresEmCall = this.GetPlayerGames();
        
        ListaJogadoresEmCall.forEach(player => {     
            if(player[3] == false){
                var volume = VolumeNormal;
                var forcarVolume = ForcarVolume[player[1]];
                if(forcarVolume != undefined){
                    volume = forcarVolume;
                }
            
                MediaEngineActions.setLocalVolume(player[0], volume, null);
            }
        });
    }
    

    MutarOutrosJogadores(){
        var idUsuario = this.GetIDProprio();
        var jogoAtual = this.GetUserJogo2() //

        if(jogoAtual == null){this.Erro("Jogo não foi iniciado");return false}

        var ListaJogadoresEmCall = this.GetPlayerGames();

        ListaJogadoresEmCall.forEach(player => {
            if(player[0] == idUsuario || player[3] == true){return false} //se for o player ou estiver mutado
            if(player[2] != jogoAtual){
                MediaEngineActions.setLocalVolume(player[0], VolumeMinimo, null);
            }
        });
        return true;
    }


    
    //Busca o jogo que o jogador esta jogando - Metodo 2
    GetUserJogo2(){
        var painelJogo = document.querySelector("div.panel-2ZFCRb");
        if(painelJogo == undefined){return null;}
        var texto = painelJogo.querySelector("div.title-338goq");
        if(texto == undefined){return null;}

        var jogo = texto.textContent;
        return jogo;
    }

    //Busca o game que o usuario ta jogando
    GetUserJogo(idUsuario){
        var ElementoLista = document.querySelector("div.members-3WRCEx"); 
        var avatar = ElementoLista.querySelector("img[src*='"+idUsuario+"']")
        if(avatar == null){return 0;}
        var playerElemento = avatar.closest(".memberInner--L4X2b")
        if(playerElemento == null){return 0;}
        var jogandoElement = playerElemento.querySelector(".textRuler-1DsANg > strong");


        var jogo = 0
      
        if(jogandoElement != null || jogandoElement != undefined){
            jogo = jogandoElement.textContent;
            
        }
        return jogo;
    }

    //Dos Players na call, busca todos os jogos
    GetPlayerGames(){
        var ListaPlayers = this.GetListaPlayers();

        var ListaPlayersResult =  new Array;

        ListaPlayers.forEach(player => {
            ListaPlayersResult.push([player[0], player[1], this.GetUserJogo(player[0]), player[2]]);

        });

        return ListaPlayersResult;
    }


    //Verifica se o discord ta com os paineis necessarios abertos para funcionar
    VerificarDiscord(){
        //Painel de usuarios na direita
        var painelDireita = document.querySelector("div.container-2o3qEW");
        var painelEsquerda = document.querySelector("div.sidebar-1tnWFu");
        
        if(painelDireita != undefined && painelEsquerda != undefined){
            return true;
        }

        if(painelDireita == undefined){
            this.Erro("Abra o painel de Amigos no Servidor")
        }
        
        return false;
    }



    //PAINEL ESQUERDO





    //Busca a lista e Players na Call
    GetListaPlayers(){
        var idUsuario = this.GetIDProprio();
        var Canal = this.GetElementoCanal(idUsuario);
        var UsuariosElemento = Canal.querySelectorAll("div[style].userAvatar-3Hwf1F");

        var ListaUsuarios =  new Array;
        UsuariosElemento.forEach(elemento => {
            var id = this.GetIdUrl(elemento.getAttribute("style"));
            //Nome dentro do elemento do usuario - div.usernameFont-2oJxoI
            var nome = elemento.parentElement.querySelector("div ~ div.usernameFont-2oJxoI").textContent
            var mutado = elemento.parentElement.querySelector("svg.icon-N9JZb6:not(.iconServer-GeSR0b)") == null || undefined? false : true;

            ListaUsuarios.push([id, nome, mutado])
        });

        return ListaUsuarios;
        
    }


    //Busca o elemento canal que o usuario esta incluido
    GetElementoCanal(idUsuario){
        //Elemento Lista de Canais - ul.content-yjf30S
        var ListaCanaisElemento = document.querySelector("ul.content-yjf30S"); 
        //Avatar do usuario
        var avatar = ListaCanaisElemento.querySelector("div[style*='"+idUsuario+"']");
        //Busca os avos do elemento
        //Elemento canal usa - .containerDefault-YUSmu3

        if(avatar == undefined){
            this.Erro("Deixe o servidor em Call aberto durante o uso")
        }

        return avatar.closest(".containerDefault-YUSmu3")
    }


    /// UTIL
    Erro(msg){
        BdApi.showToast(msg, {type: "error"})
    }


    GetIDProprio(){
        //Elemento Avatar - .avatarStack-3Bjmsl
        var elemento = document.querySelector(".avatarStack-3Bjmsl >img");
        return this.GetIdAvatar(elemento);
    }

    GetIdUrl(url){
        var padrao = /\/avatars\/([^/]+)\//;
        return padrao.exec(url)[1];
    }

    GetIdAvatar(ElementoAvatar){
        var conteudo = ElementoAvatar.src;
        return this.GetIdUrl(conteudo);
    }

    AddOnCall(func){
        this.ListOnCall.push(function () { //Adiciona a primeira função
            func();
        })
    }

    AddOffCall(func){
        this.ListOffCall.push(function () { //Adiciona a primeira função
            func();
        })
    }

    Mostrar(elemento){
        elemento.style.display = "block";
    }

    Ocultar(elemento){
        elemento.style.display = "none";
    }

    CPlusInit(){ //Adicona os eventos inciar do Pluguin
        
        var OnCallElement = document.querySelector('.wrapper-3Hk9OB')

        // Create an observer instance.
        this.observer = new MutationObserver(()=>{
            this.OnCall(OnCallElement);
            
        });
 
    //Listener Options
    this.observer.observe(OnCallElement, {
        attributes:    true,
        childList:     true,
        characterData: true
    });


    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'q' && e.altKey) {
            this.AutoMude();
        }
    });
    
    }

    OnCall(){
        var OnCallElement = document.querySelector('.wrapper-3Hk9OB')
        
        if(OnCallElement.childElementCount > 0){
            for (let index = 0; index < this.ListOnCall.length; index++) {
                this.ListOnCall[index]();
            }
        }else{
            for (let index = 0; index < this.ListOffCall.length; index++) {
                this.ListOffCall[index]();
            }
        }
    }

}