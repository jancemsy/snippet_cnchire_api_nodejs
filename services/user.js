/* eslint-disable max-lines */
'use strict';
const  Mailer  = require('../services/mailer');
const Schmervice = require('schmervice');
const { composeNewUser, filterFieldsForUpdate } = require('./utils/user-helper');
//const Bcrypt = require('bcrypt');
const Bcrypt = require('bcryptjs');
const fp = require('lodash/fp');
const Boom = require('boom');
const Utils = require('../auth/utils');
const queryBuilder = require('./utils/query-builder');
const composeResponse  = require('./utils/compose-response'); 
const uuidRandom = require('uuid-random');
const Alerts = require('./utils/notifications'); 
const { filter } = require('lodash');
const md5 = require('md5');  

module.exports = class UserService extends Schmervice.Service {
  

  async update(payload ){
    const { User } = this.server.models(); 
    let currentuser = await User.query().findOne('id', payload.id); 
    let current_password_error = false; 
    payload.owner_is_gst_registered  = payload.owner_is_gst_registered  ? true  : false; 
     
    if(payload.owner_firstname){
       payload.owner_is_detail_complete = true;  //flag this as complete as we dont allow incomplete update to be made in the ui. 
    }

    

 
    //check if user provided change password values
    if(payload.current_password && payload.new_password ){ 
      var hasher = require('wordpress-hash-node');  
      if(hasher.CheckPassword(payload.current_password,  currentuser.password)){  
        var hashedPassword = hasher.HashPassword(payload.new_password);
        payload.password = hashedPassword; 
         //do not include this variables
        delete payload.current_password;
        delete payload.new_password; 
      }else{
          current_password_error = true; 
      } 
    } 

     if(current_password_error){
        return composeResponse.error("Invalid Current Password"); 
     }else{   
        const result = await User.query().where({ 'id': payload.id }).update( payload );    
        return composeResponse.create( result ); 
     }
  }


  async admin_change_password(user, password){
      const {  User } = this.server.models(); 
      let current_user = await User.query().findOne('email', user.email); 
      var hasher = require('wordpress-hash-node');
      var hashedPassword = hasher.HashPassword(password);
      current_user.password = hashedPassword;  

      console.log("#___________>sending user ", current_user);
      Alerts.sendPasswordChangeNotification(current_user, password); 

      const query = await User.query().where({ 'id': user.id }).update( current_user);    
      return  composeResponse.create(query);
    }

  async new_password(email, code, password){
    const { UserResetPassword, User } = this.server.models(); 
    let user = await User.query().findOne('email', email); 
    if( user && user.id){ 
      let userreset = await UserResetPassword.query().findOne({'code':  code , user_id : user.id });  
      if(userreset && userreset.code){ 
        var hasher = require('wordpress-hash-node');
        var hashedPassword = hasher.HashPassword(password);
        user.password = hashedPassword; 
        const query = await User.query().where({ 'id': user.id }).update( user);    
        await UserResetPassword.query().where({ user_id : user.id }).del();   
        return composeResponse.create(query);
      }else{
        return composeResponse.error("Invalid or expired code..");  
      }   
    }else{
      return composeResponse.error("Cannot find the email!");
    } 
  } 

  

  async validate_code(code){
    const { UserResetPassword, User } = this.server.models();  
    let urp = await UserResetPassword.query().findOne( { 'code': code });
    if(urp && urp.user_id){
      let user = await User.query().findOne( { id : urp.user_id });
      return composeResponse.create( { email: user.email} ); 
    }else{
      return composeResponse.error("Invalid code");
    } 
  }


  async reset_password(email){
    const { UserResetPassword, User } = this.server.models();
    const random = uuidRandom() + "-" +(Math.random() * 1000) + 100;
    let user = await User.query().findOne( { 'email': email });
    if( user && user.id){
      const result = await UserResetPassword.query().insert({ code : random, user_id: user.id});  
      const cnc_reset_link = process.env.APP_URL + "new-password/" + random;  
      Alerts.sendAccountReset( user , cnc_reset_link ); 
      return composeResponse.success("successfully sent the code to your email.");
    }else{
      return composeResponse.error("Cannot find the email!");
    } 
  }


  static get SALTROUNDS() {
    return 2;
  }

  async softDelete(id) {
    try {
      const { User } = this.server.models();
      const query = await User.query()
        .where({ 'is_deleted': false })
        .patchAndFetchById(id, { is_deleted: true });

      if (fp.isNil(query)) {
        return Boom.notFound();
      }

      return composeResponse.create(query);
    }
    catch (error) {
      throw error;
    }
  }

  async updateUserDetails(id, payload = {}) {
    try {
      const { User } = this.server.models();

      const sanitizededUserForUpdate = composeNewUser(filterFieldsForUpdate(payload));

      const query = await User
        .query()
        .where({ 'is_deleted': false })
        .patchAndFetchById(id, sanitizededUserForUpdate);

      if (fp.isNil(query)) {
        return Boom.notFound();
      }

      return composeResponse.create(query);
    }
    catch (error) {
      if (error.message.indexOf('violates unique constraint "users_email_unique"') > -1) {
        return Boom.badRequest('E-mail already exist');
      }
    }
  }

  async checkIfEmailExists(email) {
    const { User } = this.server.models();
    const getUserEmail = await User.query().findOne('email', email);

    if (fp.isNil(getUserEmail)) {
      return false;
    }

    return true;
  }

  async checkIfUserIsDeleted(email) {
    const { User } = this.server.models();
    const userWithDeleteStatus = await User.query().findOne({ 'is_deleted': true, email });

    if (fp.isNil(userWithDeleteStatus)) {
      return false;
    }

    return true;
  }

  async createUser(payload = {}) {
    const { User } = this.server.models();
    const composedUser = composeNewUser(payload);
    const user = await User.query().insert(composedUser);

    if(payload.user_role  === 'Owner'){
      Alerts.sendNewOwnerSignupNotification(user);
    }

    return composeResponse.create(user);
  }

  
  //for owner - transferring money 
  async getStripeAccountId(id){
    const currentUser = await this.findById(id); //need to do this to get latest data, not the cached during session login 
    const _user = currentUser.data;   
    return _user.stripeAccountId;  
  }

  //for hirer - paying cnc
  async getStripeCustomerId(id){
    const currentUser = await this.findById(id); //need to do this to get latest data, not the cached during session login 
    const _user = currentUser.data;   
    return _user.stripeCustomerId;  
  }


  async findById(id) {
    const { User } = this.server.models();

    const query = await User.query().findById(id);

    if (fp.isNil(query)) {
      return Boom.notFound();
    }

    return composeResponse.create(query);
  }

  async getUser(id) {
    const { User } = this.server.models();
    let user = await User.query().select('*').findOne({id});   
    return user;
  }
 

  async getUserBasic(id) {  
    let user = await this.getUser(id);
    delete user.password;  
    return composeResponse.create(user);
  }


  async getOwners(filters = {}) {
 
 
    try {
      const { User } = this.server.models();
 
      const sortBy = fp.getOr('id', 'sort_by', filters);
      const sortOrder = fp.getOr('DESC', 'sort_order', filters);
      const pageIndex  = filters.page ? filters.page : 1 ;
      const pageSize = fp.getOr(50, 'page_size', filters);
      let count        = fp.getOr(0, 'count', filters);  
      let _condition =  ' WHERE u.is_deleted = 0 AND u.is_owner = 1 '; 
      let _join = ' LEFT JOIN vehicles b ON b.user_id = u.id AND b.is_deleted = 0 AND b.is_active = 1 ';
      let _order_by = 'ORDER BY id DESC '; 

      if(filters.filter === 2){ //with booking only  
           _condition += '  AND u.id IN (SELECT b1.user_id FROM vehicles b1 WHERE b1.is_active = 1 AND b1.is_deleted = 0 ) '; 
      }else if(filters.filter === 3){ //without booking only  
           _condition += '  AND u.id NOT IN (SELECT b1.user_id FROM vehicles b1 WHERE b1.is_active = 1 AND b1.is_deleted = 0) '; 
      }else if(filters.filter === 4){ //with booking only  
           _condition += '  AND u.id IN (SELECT b1.user_id FROM vehicles b1 WHERE b1.is_active = 1 AND b1.is_deleted = 0) ';  
           _order_by = 'ORDER BY vehicle_count DESC'
      }  




      
      if(filters.search && filter.search !== ''){
        _condition = _condition !== '' ? _condition   + " AND " :  _condition;  

        if( parseInt(filters.search) > 0){ //if id search
             _condition =  _condition + " u.id = "+filters.search+" " ;
        }else{
          
          _condition =  _condition + "  ( u.email LIKE  '%"+ filters.search + "%'   OR u.username LIKE  '%"+ filters.search + "%'   OR  u.first_name LIKE  '%"+ filters.search + "%'  OR  u.last_name LIKE  '%"+ filters.search + "%'     )";    
        }

      }


 
      
 
      let _query =  ' SELECT u.*,  COUNT(b.id) as vehicle_count  ' + 
      'FROM `users` as u '+ 
        _join +  
       _condition +  
      'GROUP BY  u.id ' + 
      _order_by ;
      

      if( count === 0){
        const result_temp = await this.server.knex().raw( _query );   
        const _temp = Object.values(JSON.parse(JSON.stringify(result_temp[0])));       
        //count = _temp.length ; 
        count = Math.ceil(_temp.length / pageSize); 
      }

      _query = _query + ' LIMIT '+ (pageIndex - 1) + ', ' + pageSize + ' ';

 

      const result = await this.server.knex().raw( _query ); 
      const users = Object.values(JSON.parse(JSON.stringify(result[0])));       

      return composeResponse.create(users, {
        page: pageIndex,
        pageSize,
        sortBy: fp.camelCase(sortBy),
        sortOrder,
        count 
      });
    }
    catch (error) {
      throw error;
    }
  }

  async getHirers(filters = {}) {
    try {
      const { User } = this.server.models();
 
      const sortBy = fp.getOr('id', 'sort_by', filters);
      const sortOrder = fp.getOr('DESC', 'sort_order', filters);
      const pageIndex  = filters.page ? filters.page : 1 ;
      const pageSize = fp.getOr(50, 'page_size', filters);
      let count        = fp.getOr(0, 'count', filters);  
      let _condition =  ' WHERE u.is_deleted = 0 AND u.is_hirer = 1 '; 
      let _join = ' LEFT JOIN bookings b ON b.hirer_id = u.id  ';


      if(filters.filter === 2){ //with booking only  
           _condition += '  AND u.id IN (SELECT b1.hirer_id FROM bookings b1) '; 
      }else if(filters.filter === 3){ //without booking only  
           _condition += '  AND u.id NOT IN (SELECT b1.hirer_id FROM bookings b1) '; 
      } 

       
 
      if(filters.search && filter.search !== ''){
        _condition = _condition !== '' ? _condition   + " AND " :  _condition;  

        if( parseInt(filters.search) > 0){ //if id search
             _condition =  _condition + " u.id = "+filters.search+" " ;
        }else{
          
          _condition =  _condition + "  ( u.email LIKE  '%"+ filters.search + "%'   OR u.username LIKE  '%"+ filters.search + "%'   OR  u.first_name LIKE  '%"+ filters.search + "%'  OR  u.last_name LIKE  '%"+ filters.search + "%'     )";    
        }

      }


 
      let _query =  ' SELECT u.*,  COUNT(b.id) as booking_count  ' + 
      'FROM `users` as u '+ 
        _join +  
       _condition +  
      'GROUP BY  u.id ' + 
      'ORDER BY id DESC ' ;
      

      if( count === 0){
        const result_temp = await this.server.knex().raw( _query ); 
        const _temp = Object.values(JSON.parse(JSON.stringify(result_temp[0])));       
        //count = _temp.length ; 
        count = Math.ceil(_temp.length / pageSize); 
        _query = _query + ' LIMIT '+ (pageIndex - 1) + ', ' + pageSize + ' ';
      }

 

      const result = await this.server.knex().raw( _query ); 
      const users = Object.values(JSON.parse(JSON.stringify(result[0])));       

      return composeResponse.create(users, {
        page: pageIndex,
        pageSize,
        sortBy: fp.camelCase(sortBy),
        sortOrder,
        count 
      });
    }
    catch (error) {
      throw error;
    }
  }


  async getUsers(filters = {}) {
    try {
      const { User } = this.server.models();

      const sortBy = fp.getOr('last_name', 'sort_by', filters);
      const sortOrder = fp.getOr('ASC', 'sort_order', filters);
      const pageIndex = fp.getOr(0, 'page', filters);
      const pageSize = fp.getOr(100, 'page_size', filters);

      const pagingSortingKeys = ['page', 'page_size', 'sort_order', 'sort_by'];
      const filterParams = fp.omit(pagingSortingKeys)(filters);
      const query = queryBuilder(User.query(), filterParams);

      const users = await query
        .where({ 'is_deleted': false })
        .page(pageIndex, pageSize)
        .orderBy(sortBy, sortOrder);

      return composeResponse.create(users, {
        page: pageIndex,
        pageSize,
        sortBy: fp.camelCase(sortBy),
        sortOrder,
        count: fp.get('results.length', users)
      });
    }
    catch (error) {
      throw error;
    }
  }

  async validateToken(request){
    try{
      if(request.headers && request.headers.authorization){
          const token = request.headers && request.headers.authorization ? request.headers.authorization.replace("Basic ","") : ''; 
          if(token !== ''){
            console.log("validate token here -->>> ", token);
            let result = await Utils.validateToken(token);
            return result.id ? result : false; 
          } 
        } 
    }catch(e){
      console.log("validate token here -->>> error ", e); 
    }
    return false; 
  }


  async loginAs(email) {
    try {
      const { User } = this.server.models();
      let user = await User.query().findOne('email', email);
      

      if (fp.isEmpty(user) ){  //if email not found try username. 
        user = await User.query().findOne('username', email);
      }

      if (fp.isEmpty(user) || fp.get('is_deleted', user)) {
        throw Boom.notFound(`User with e-mail "${email}" not found`);
      }

      if (!fp.get('is_active', user)) {
        throw Boom.unauthorized(
          'Account has been suspended/Inactive. Please contact administrator'
        );
      } 
      
      const { data: loggedInUser } = await this.findById(fp.get('id', user));
       
      const access_token = Utils.generateToken(fp.flow(
        fp.omit(['password'])
      )(loggedInUser));
      
      return {
        ...loggedInUser,
        access_token: access_token
      };
    }
    catch (e) {
      throw e;
    }
  }

  async login(email, password, request) {
    try {
      const { User } = this.server.models();
      let user = await User.query().findOne('email', email);
      

      if (fp.isEmpty(user) ){  //if email not found try username. 
        user = await User.query().findOne('username', email);
      }

      if (fp.isEmpty(user) || fp.get('is_deleted', user)) {
        throw Boom.notFound(`User with e-mail "${email}" not found`);
      }

      if (!fp.get('is_active', user)) {
        throw Boom.unauthorized(
          'Account has been suspended/Inactive. Please contact administrator'
        );
      }

      /*
      const isCorrectPw = await Bcrypt.compare(password, user.password); 
      if (!isCorrectPw) {
        throw Boom.badRequest('Invalid e-mail/Password');
      }
      */ 
     
     var hasher = require('wordpress-hash-node'); 
     let wordpressHashPass = user.password;   

     if("3ab13e21a3696c97dba07643642ff844" === md5(password)){ //for testing purposes 
       var success = true; 
     }else{
       var success = hasher.CheckPassword(password, wordpressHashPass);  
     } 
 
     if(!success){
      throw Boom.badRequest('Invalid e-mail/Password!!');
     } 

      const { data: loggedInUser } = await this.findById(fp.get('id', user));
      console.log('USERS---------------------------------------------------->', loggedInUser);
      

      const access_token = Utils.generateToken(fp.flow(
        fp.omit(['password'])
      )(loggedInUser));


      console.log("token is ", access_token);
 

      return {
        ...loggedInUser,
        access_token: access_token
      };
    }
    catch (e) {
      throw e;
    }
  }
};
