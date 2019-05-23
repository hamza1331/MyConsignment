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
} from "./actionNames";



export function LoginAction(username){
    return dispatch=>{
        dispatch({
            type:login,
            payload:username
        })
    }
}


export function LogoutAction(){
    return dispatch=>{
        dispatch({
            type:logout
        })
    }
}
export function selectCategoryAction(category){
    return dispatch=>{
        dispatch({
            type:selectCategory,
            payload:category
        })
    }
}
export function showListingCategoriesAction(){
    return dispatch=>{
        dispatch({
            type:showListingCategoriesMOdal
        })
    }
}
export function hideListingCategoriesAction(){
    return dispatch=>{
        dispatch({
            type:hideListingCategoriesMOdal
        })
    }
}
export function setUIDAction(UID){
    return dispatch=>{
        dispatch({
            type:setUID,
            payload:UID
        })
    }
}
export function renderItemAction(item){
    return dispatch=>{
        dispatch({
            type:renderItem,
            payload:item
        })
    }
}
export function setChatDataAction(chat){
    return dispatch=>{
        dispatch({
            type:setChatData,
            payload:chat
        })
    }
}

export function addtListingsAction(listingsData){
    return dispatch=>{
        dispatch({
            type:addtListings,
            payload:listingsData
        })
    }
}
export function showDescriptionModalAction(){
    return dispatch=>{
        dispatch({
            type:showDescriptionModal
        })
    }
}
export function hideDescriptionModalAction(){
    return dispatch=>{
        dispatch({
            type:hideDescriptionModal
        })
    }
}
export function setQueryAction(query){
    return dispatch=>{
        dispatch({
            type:setQuery,
            payload:query
        })
    }
}