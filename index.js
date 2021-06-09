const app=Vue.createApp({
    data(){
        return{
           url:`https://vue3-course-api.hexschool.io`,
           api:'v268018',
           products:{},//產品列表
           tempProduct:{},//暫定單筆產品資訊(調整)
           carts:{},//購物車列表
           loading:{//判斷載入各種資料(寫物件是因為要讓子元件好修改)
                itemState:'', 
           },
           isLoading:true,
           form:{//表單內容
            "user": {
              "name": "",
              "email": "",
              "tel": "",
              "address": "",
            },
            "message": "",
          }
        } 
    },
    methods: {
        isPhone(value) {//驗證表單手機號碼
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼(手機號碼)'
        },
        createdOrder(){//建立結帳
            const url = `${this.url}/api/${this.api}/order`;
            axios.post(url,{data:this.form})
            .then(res=>{
                console.log(res);
                if(res.data.success){
                    alert(res.data.message);
                    this.$refs.form.resetForm();//重製使用者資訊
                    this.getCart();//重製購物車列表畫面
                }else{
                    alert(res.data.message);
                }
            }).catch(err=>{
                console.log(err);
            })
        },
        removeAllCart(){//刪除購物車(全部)
            const url = `${this.url}/api/${this.api}/carts`;
            this.loading.itemState="remove";//開啟讀取
            axios.delete(url)
            .then(res=>{
                if(res.data.success){
                    alert(res.data.message);
                    this.loading.itemState='';//關閉讀取
                    this.getCart();//重新讀取購物列表
                }else{
                    alert(res.data.message);
                }
            }).catch(err=>{
                console.log(err);
            })
        },
        removeCart(id){//刪除購物車(單筆)
            const url = `${this.url}/api/${this.api}/cart/${id}`
            axios.delete(url)
            .then(res=>{
                console.log(res);
                if(res.data.success){
                    alert(res.data.message);
                    this.getCart();//重新讀取購物列表
                }else{
                    alert(res.data.message);
                }
            }).catch(err=>{
                console.log(err);
            })
        },
        upDateCart(id,qty){//更新購物車(單筆)
            const url =` ${this.url}/api/${this.api}/cart/${id}`;
            const postData = { "product_id":id,qty};
            this.loading.itemState=id;//關掉編輯
            axios.put(url,{"data":postData})
            .then(res=>{
                console.log(res);
                this.loading.itemState='';//開啟編輯
                this.getCart();
            }).catch(err=>{
                console.log(err);
            })
        },
        addCart(id,qty=1){//加入購物車
            const url = `${this.url}/api/${this.api}/cart`;
            const postData = {"product_id":id,qty} ;

            this.loading.itemState=id;//沒有辦法把id加入作為loading效果為判斷
            console.log(this.loading.itemState===id);
            console.log(this.loading.itemState);

            this.$refs.userProductModal.hideModal();//關掉modal
            axios.post(url,{"data":postData})
            .then(res=>{
                if(res.data.success){
                    alert(res.data.message);
                    this.getCart();
                    this.loading.itemState='';
                }else{
                    alert(res.data.message);
                }
            }).catch(err=>{
                console.log(err);
            })
        },
        getCart(){//取得購物車列表
            const url =`${this.url}/api/${this.api}/cart`;
            axios.get(url)
            .then(res=>{
                if(res.data.success){
                    this.carts=res.data.data;
                }else{
                    alert(res.data.message);
                }
            }).catch(err=>{
                console.log(err);
            })
        },
        getProducts(){//取得產品列表(所有)
            const url = `${this.url}/api/${this.api}/products/all`
            axios.get(url)
            .then(res=>{
                this.products=res.data.products;
            }).catch(err=>{
                console.log(err);
            })
        },
        getProduct(id){//取得單一產品
            this.loading.itemState=id;
            axios.get(`${this.url}/api/${this.api}/product/${id}`)
            .then(res=>{
                this.tempProduct=res.data.product;
                this.$refs.userProductModal.openModal();
            }).catch(err=>{
                console.log(err);
            })
        },
    },
    created() {
        this.getProducts();//取得產品列表
        this.getCart();//取個購物車列表
    },
})
// 表單套件 ------------------------------------------------
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});
// 元件
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);
// ---------------------------------------------------------
app.component('userProductModal',{
    props:['tempProduct','loading'],
    data(){
        return {
            userProductModal:'', //modal
            qty:1,//編輯產品數量
        }
    },
    watch:{
        qty(){//檢查使用者是否輸入0
            if(this.qty<=0){
                alert('產品數量不可以小於零');
                this.qty=1;
            }
        }
    },
    template: 
    `
    <div class="modal fade" tabindex="-1" role="dialog"
    aria-labelledby="exampleModalLabel" aria-hidden="true" data-bs-backdrop="static" 
                ref="modal">
     <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
       <div class="modal-content border-0">
         <div class="modal-header bg-dark text-white">
           <h5 class="modal-title" id="exampleModalLabel">
             <span>{{ tempProduct.title }}</span>
           </h5>
           <button type="button" class="btn-close"
                   data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">
           <div class="row">
             <div class="col-sm-6">
               <img class="img-fluid" :src="tempProduct.imageUrl" alt="">
             </div>
             <div class="col-sm-6">
               <span class="badge bg-primary rounded-pill">{{ tempProduct.category }}</span>
               <p>商品描述：{{ tempProduct.description }}</p>
               <p>商品內容：{{ tempProduct.content }}</p>
               <div class="h5" v-if="!tempProduct.price">{{ tempProduct.origin_price }} 元</div>
               <del class="h6" v-if="tempProduct.price">原價 {{ tempProduct.origin_price }} 元</del>
               <div class="h5" v-if="tempProduct.price">現在只要 {{ tempProduct.price }} 元</div>
               <div>
                 <div class="input-group mb-2">
                   <input type="number" class="form-control"
                         v-model.number="qty" min="1">
                   <button type="button" class="btn btn-primary"
                       @click="$emit('addCart',tempProduct.id,qty)">
                        加入購物車
                   </button>
                 </div>
                 <div class="d-flex justify-content-end">
                    <button type="button" class="btn btn-danger"
                    @click="hideModal">
                        取消
                    </button>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
    `
    ,
   methods:{
    openModal(){//打開modal
        this.userProductModal.show();
    },
    hideModal(){//關掉modal
        this.userProductModal.hide();
        this.loading.itemState='';
    }
   },
   mounted(){
     this.userProductModal=new bootstrap.Modal(this.$refs.modal);//初始化modal
   },
})
// app.component('loading', VueLoading) //加入loading效果有問題
app.mount('#app');

