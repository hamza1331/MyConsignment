import { 
    login,
    logout,
    selectCategory,
    showListingCategoriesMOdal,
    hideListingCategoriesMOdal,
    setUID,
    renderItem,
    setChatData,
    addtListings,
    showDescriptionModal,
    hideDescriptionModal,
    setQuery
} from "../actions/actionNames";
const initialState = {
    isLoggedIn:false,
    userName:'',
    selectedCategory:'',
    showListingCategories:false,
    UID:'',
    item:null,
    chatData:null,
    data:[],
    showDescription:false,
    query:null
}

export default (state = initialState,action)=>{
    switch(action.type){
        case login:
        return{
            ...state,
            isLoggedIn:true,
            userName:action.payload
        }
        case logout:
        return {
            ...state,
            isLoggedIn:false,
            userName:''
        }
        case selectCategory:
        return{
            ...state,
            selectedCategory:action.payload
        }
        case showListingCategoriesMOdal:
        return{
            ...state,
            showListingCategories:true
        }
        case hideListingCategoriesMOdal:

        return{
            ...state,
            showListingCategories:false
        }
        case setUID:
        return{
            ...state,
            UID:action.payload
        }
        case renderItem:
        return{
            ...state,
            item:action.payload
        }
        case setChatData:
        return{
            ...state,
            chatData:action.payload
        }
        case addtListings:
        if(action.payload.page===1){
            return{
                ...state,
                data:action.payload.listings   
            }
        }
        else{
            return{
                ...state,
                data:[...state.data,...action.payload.listings]
            }
        }
        case showDescriptionModal:
        return{
            ...state,
            showDescription:true
        }
        case hideDescriptionModal:
        return{
            ...state,
            showDescription:false
        }
        case setQuery:
        return{
            ...state,
            query:action.payload
        }
        default:
        return state
    }
}