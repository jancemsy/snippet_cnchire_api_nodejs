/* eslint-disable max-lines */
'use strict';
 const  Mailer  = require('../mailer');    
 const fs = require('fs');
 const moment = require('moment');  

 const formatCurrency = number =>  `${   ( number && Number(number).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') ) || 0  }`;




const getContent = async(file) =>{ 
  return new Promise(resolve =>{
    fs.readFile(file, 'utf8' , (err, data) => {
      if (err) { 
        resolve(false);  
      }else{ 
        resolve(data);  
      }   
    });
  });
}


 

const getEmailTemplate = async() =>{  
  return getContent(__dirname + "/../../../templates/template.html");
}

const getPayoutTable = async() =>{
  return getContent(__dirname + "/../../../templates/payout.html");
} 

const getRefundedTable = async() =>{
  return getContent(__dirname + "/../../../templates/refunded.html");
} 

const getBookingTableFull = async() =>{ 
  return getContent(__dirname + "/../../../templates/booking_table_full.html");
}


const getBookingTableFinal = async() =>{  
  return getContent(__dirname + "/../../../templates/booking_table_final.html");
}

const getBookingTableDeposit = async() =>{  
  return getContent(__dirname + "/../../../templates/booking_table_deposit.html");
}

const getCustomerTable = async() =>{  
  return getContent(__dirname + "/../../../templates/customer_detail.html");  
}

const getRequestTable = async() =>{
  return getContent(__dirname + "/../../../templates/booking_request.html");  
}


const getRequestRejectedTable = async() =>{
  return getContent(__dirname + "/../../../templates/booking_request_rejected.html");  
}

const getRequestCancelledTable = async() =>{
  return getContent(__dirname + "/../../../templates/booking_request_cancelled.html");  
}


const getRequestApprovedTable = async() =>{
  return getContent(__dirname + "/../../../templates/booking_request_approved.html");  
}

const replaceAll = (string, search, replace) => {
  return string.split(search).join(replace);
}






const bookingEmailTemplate = async (title, params, custom_text = "", $template = "") => {   
  const booking = params.booking;
  const vehicle = params.vehicle;
  const hirer = params.hirer;  
  let booking_table = '';

  switch($template){
    case 'cancelled': 
       booking_table = await getRequestCancelledTable(); 
    break;  
    case 'rejected': 
       booking_table = await getRequestRejectedTable(); 
    break;  
    case 'approved': 
      booking_table = await getRequestApprovedTable(); 
    break;   
    case 'refunded':
      booking_table = await getRefundedTable();   
    break; 
    case 'payout':
      booking_table = await getPayoutTable();   
    break;
    default: 
       if(params.booking.status === 'partial-payment'){
          booking_table = await getBookingTableDeposit();
       }else if(params.booking.status === 'paid' && params.booking.payment_type === 'partial'){          
          booking_table = await getBookingTableFinal();
       }else{
          booking_table = await getBookingTableFull();
       }
  }
    
  let template = await getEmailTemplate(); 
  let customer_table = await getCustomerTable(); 
  let body = booking_table + customer_table; 
 
  const addon_list = JSON.parse(booking.addons) || [];    

  let li_output = "";   
  for(let item of addon_list){ 
    li_output += '<li style="margin:0.5em 0 0;padding:0">' + '<strong>Additional Amenities ($' + item.price + ' ):</strong>' + '<p style="margin:0">' + item.amenity + '</p></li>'
  }  

  let booking_status = booking.status;  
  let bond_amount  = 0;
  let total_amount = 0;

  if(booking.status === 'refunded' ){
    bond_amount = booking.bond_amount;
    total_amount = booking.total_amount;  
  }else if(booking.status === 'partial-payment'){
     bond_amount = booking.bond_amount/2;
  }else if(booking.status === 'paid'){
    if(booking.payment_type === 'full'){
      bond_amount = booking.bond_amount;
      total_amount = booking.total_amount;
    }else{
      bond_amount = booking.bond_amount / 2;
      total_amount = booking.total_amount - bond_amount;
    }
  }else{ //this is passed payment. now return to normal amount total etc 
    bond_amount = booking.bond_amount;
    total_amount = booking.total_amount;
  }

  

  template = replaceAll(template, "TEMPLATE_TITLE", title);
  template = replaceAll(template, "TEMPLATE_BODY", body); 
  template = replaceAll(template, "CUSTOM_TEXT",custom_text);
  template = replaceAll(template, "BOOKING_NAME", vehicle.vehicle_name);   
  template = replaceAll(template, "BOOKING_ID", booking.id);
  template = replaceAll(template, "BOOKING_STATUS", booking_status);

  template = replaceAll(template, "BOOKING_SECURITY_BOND_DEPOSIT",formatCurrency(bond_amount)); 
  template = replaceAll(template, "BOOKING_SECURITY_BOND", formatCurrency(bond_amount) ); 
  

  template = replaceAll(template, "BOOKING_PERIOD", moment(booking.start_date).format("ll") + " - " +  moment(booking.end_date).format("ll")  );
  template = replaceAll(template, "BOOKING_LINK", process.env.APP_URL + "dashboard/bookings/");
  template = replaceAll(template, "BOOKING_SUBTOTAL",  formatCurrency(bond_amount + booking.booking_cost ) ); 

  template = replaceAll(template, "BOOKING_ADDONS_FEE",  formatCurrency(booking.total_addons_amount ) ); 
  template = replaceAll(template, "BOOKING_ADDONS", li_output !== '' ? '<ul style="font-size:small;margin:1em 0 0;padding:0;list-style:none">'+ li_output +'</ul>' : ''	);  
  template = replaceAll(template, "BOOKING_INSURANCE_FEE",  formatCurrency(booking.insurance_fee ) );  

  template = replaceAll(template, "BOOKING_TOTAL_DEPOSIT", formatCurrency(booking.insurance_fee + bond_amount + booking.booking_fee) );
  template = replaceAll(template, "BOOKING_TOTAL_FINAL", formatCurrency(booking.booking_cost + bond_amount + booking.total_addons_amount) );  

  template = replaceAll(template, "BOOKING_ADULT", booking.no_adult_travellers);
  template = replaceAll(template, "BOOKING_CHILDREN", booking.children_travelers);
  template = replaceAll(template, "BOOKING_PLANNED_STATE", booking.planned_destination_state);  


  
  template = replaceAll(template, "BOOKING_ITERERARY",booking.additional_notes);
  template = replaceAll(template, "BOOKING_SERVICE_FEE",formatCurrency(booking.booking_fee)); //service
  template = replaceAll(template, "BOOKING_TOTAL", formatCurrency(total_amount));
  template = replaceAll(template, "BOOKING_COST",formatCurrency(booking.booking_cost)); 
  template = replaceAll(template, "BOOKING_TRAVELLERS",booking.total_guest);
  template = replaceAll(template, "BOOKING_PLANNED_DESTINATION",booking.planned_destinations);
  template = replaceAll(template, "VEHICLE_MAKE", booking.towing_vehicle_make);
  template = replaceAll(template, "VEHICLE_MODEL",booking.vehicle_model);
  template = replaceAll(template, "VEHICLE_YEAR",booking.vehicle_year);
  template = replaceAll(template, "VEHICLE_TOWING_CAPACITY",booking.towing_capacity);
  template = replaceAll(template, "VEHICLE_TOWING_TOW_BAR",booking.towing_vehicle_tow_bar);
  template = replaceAll(template, "VEHICLE_BREAK_CONTROLLER",booking.electronic_brakes);
  template = replaceAll(template, "VEHICLE_TOWING_EXPERIENCE",booking.towing_experience);  
  template = replaceAll(template, "CUSTOMER_EMAIL", hirer.email);
  template = replaceAll(template, "CUSTOMER_PHONE", hirer.contact_number);
  template = replaceAll(template, "CUSTOMER_NAME", hirer.first_name + " " + hirer.last_name); 
  template = replaceAll(template, "ADDRESS_LINK","https://www.google.com/maps/search/" + encodeURI(hirer.address) + "?entry=gmail&amp;source=g");
  template = replaceAll(template, "ADDRESS_1",hirer.address);
  template = replaceAll(template, "ADDRESS_2",hirer.address2 ? "<br>" + hirer.address2 : "");   

  template = replaceAll(template, "BOOKING_COMMISSION", booking.commission);
  template = replaceAll(template, "BOOKING_HIRE_INCOME_PERCENT", 100 - booking.commission); 

  template = replaceAll(template, "TOTAL_EARNINGS", formatCurrency(booking.total_earnings));
  template = replaceAll(template, "INSURANCE_TOTAL", formatCurrency(booking.insurance_fee  * 0.90 )); 
  template = replaceAll(template, "VEHICLE_FREE_CAMPING", booking.is_free_camping  ? 'YES' : 'NO'); 
  const total_booking_cost = booking.booking_cost + booking.total_addons_amount; 
  template = replaceAll(template, "BOOKING_HIRE_INCOME_TOTAL", formatCurrency( total_booking_cost - ( total_booking_cost * (booking.commission / 100) )));  
  template = replaceAll(template, "APPROVE_LINK", process.env.APP_URL + "approve/" + booking.id);  
  return template;
} 



const sendBookingNotification = async (send_to_email,  subject, body_title, params, custom_text = "", template = "") => {  
  const html = await bookingEmailTemplate(body_title, params, custom_text, template);    
  const mailer = new Mailer();  
  mailer.send({ to: send_to_email,  subject,  html  });  
}


//$25charge fee applied 
const bondClaimTemplateForm = async(params , template = 'bond_claim.html') =>{
  const booking = params.booking;
  const vehicle = params.vehicle;
  const owner   = params.owner;
  const hirer = params.hirer;  
  const hirer_name = hirer.first_name + " " + hirer.last_name;
  const owner_name = owner.first_name + " " + owner.last_name; 
  const bondclaims = params.bondclaims;

  let form_template = await getContent(__dirname + "/../../../templates/" + template);  
  let content_items = '';
  let items = JSON.parse(bondclaims.items); 

  for(let i = 0 ; i < items.length; i ++){
       let _item = items[i].item;
       let _cost = "$" + formatCurrency(items[i].cost); 
       content_items += '<tr class=""><td>' + _item + '</td>  <td>' + _cost + '</td></tr>'; 
  }  

  content_items += '<tr class=""><td>Admin Process Fee</td>  <td>$25.00</td></tr>';  

  ///const subtotal =  formatCurrency(booking.bond_amount - booking.bond_claim_amount);

  form_template = replaceAll(form_template, "SECURITY_BOND", formatCurrency(booking.bond_amount));
  form_template = replaceAll(form_template, "CARAVAN", vehicle.vehicle_name);
  form_template = replaceAll(form_template, "HIRER_NAME", hirer_name); 
  form_template = replaceAll(form_template, "OWNER_NAME", owner_name); 
  form_template = replaceAll(form_template, "BOND_CLAIM_TOTAL", formatCurrency(booking.bond_claim_amount)); 
  form_template = replaceAll(form_template, "BOOKING_ID",  booking.id);
  form_template = replaceAll(form_template, "CONTENT_ITEMS",  content_items);   
  form_template = replaceAll(form_template, "DATE_OF_RETURN", moment(bondclaims.date_of_return).format("ll"));
  form_template = replaceAll(form_template, "BOND_CLAIMED_TOTAL", formatCurrency(booking.bond_claim_amount - 25));
  form_template = replaceAll(form_template, "BOND_RETURNED_TOTAL",  formatCurrency(booking.bond_amount - booking.bond_claim_amount));

  //form_template = replaceAll(form_template, "SUB_TOTAL",   subtotal);  
  //form_template = replaceAll(form_template, "TOTAL BOND_RETURNED_TOTAL RETURNED",  formatCurrency(booking.bond_amount - booking.bond_claim_amount)); 

  return form_template;
}


exports.sendNewOwnerSignupNotification = async(user) => {
  let template = await getContent(__dirname + "/../../../templates/new_owner_signup.html");   
  template = replaceAll(template, "OWNER_DASHBOARD_LINK", process.env.APP_URL + "dashboard/vehicles" ); 

  let subject  = "Welcome to Caravan and Camping Hire AU"; 
  const html = template; 
  const mailer = new Mailer();  

  mailer.send({ to: user.email ,  subject:  subject,  html  });  
  mailer.send({ to: "enquiries@cnchire.com.au", subject: "[sent-to-owner]" + subject, html });    
}


//send to admin 
exports.sendNewVehicleAdminNotifications = async (vehicle, user ) =>{
  let template = await getContent(__dirname + "/../../../templates/new_vehicle.html");  
  template = replaceAll(template, "VEHICLE_TITLE", vehicle.vehicle_name); 
  template = replaceAll(template, "VEHICLE_LINK", process.env.APP_URL + "dashboard/vehicles?id=" + vehicle.id ); 
  const name = user.firstName + " " + user.lastName;
  
  const subject  = "New owner vehicle - submitted by " + name + " - " + vehicle.vehicle_name; 
  const html = template; 
  const mailer = new Mailer();  
  mailer.send({ to: "enquiries@cnchire.com.au",  subject,  html });    
}


exports.sendPasswordChangeNotification = async(current_user, password) =>{ 
  const mailer = new Mailer();  
  let template = await getContent(__dirname + "/../../../templates/admin_password_changed.html");    
  let subject  = "Your password has been updated "; 
  let html = ""; 

  template = replaceAll(template , "SUBJECT", subject); 
  template = replaceAll(template , "NEW_MESSAGE", "Your  password has been changed to: <b>"+ password +" </b>");
 
  html = replaceAll(template, "NAME", current_user.first_name + " " + current_user.last_name); 
  mailer.send({ to: current_user.email,  subject,  html  });     
  mailer.send({ subject :  "[sent-to-user]" + subject,    to: "enquiries@cnchire.com.au",  html });      
}

exports.sendNewChatNotifications = async(message, sender, hirer, owner) => {
  const mailer = new Mailer();  
  let template = await getContent(__dirname + "/../../../templates/new_message.html");    
  let subject  = "You have a new chat from " + sender.firstName; 
  let html = ""; 

  template = replaceAll(template , "NEW_MESSAGE", message);
 
  switch( sender.userRole ){
    case 'Hirer':  
        html = replaceAll(template, "NAME", owner.first_name + " " + owner.last_name); 
        mailer.send({ to: owner.email,  subject,  html  });  
        mailer.send({ replyTo :  hirer.email,   to: "enquiries@cnchire.com.au",  subject :  "[sent-to-owner]" + subject,  html });    
    break;
    case 'Owner': 
        html = replaceAll(template, "NAME", hirer.first_name + " " + hirer.last_name ); 
        mailer.send({ to: hirer.email,  subject,  html  });   
        mailer.send({ replyTo :  owner.email,    to: "enquiries@cnchire.com.au",  subject :  "[sent-to-owner]" + subject,  html });    
    break;
    default:  //sender admin?

        //send to the two? 
        html = replaceAll(template, "NAME", owner.first_name + " " + owner.last_name); 
        mailer.send({ to: owner.email,  subject,  html  });  

        html = replaceAll(template, "NAME", hirer.first_name + " " + hirer.last_name ); 
        mailer.send({ to: hirer.email,  subject,  html  });  
  }  

}


//send to user 
exports.sendAccountReset = async (  user , link) =>{
  let template = await getContent(__dirname + "/../../../templates/reset_password.html");   
  const name = user.first_name + " " + user.last_name; 
  let html = replaceAll(template, "NAME", name); 
  html = replaceAll(html, "RESET_LINK", link); 

  const subject  = "Pasword Reset - Caravan and Camping Hire AU";  
  const mailer = new Mailer();  
  //mailer.send({ to: "enquiries@cnchire.com.au",  subject,  html });   
  mailer.send({ to: user.email,  subject,  html  });  
}




//bond claim report 
exports.sendBondClaimNotifications = async (params) => {
  const form_template = await bondClaimTemplateForm(params); 
  const subject = "BOND CLAIM DETAILS - Booking #" + params.booking.id;
 
  let template = await getEmailTemplate(); 
  template = replaceAll(template, "TEMPLATE_TITLE", subject);
  template = replaceAll(template, "TEMPLATE_BODY", form_template);   
  let html = template;   
  const mailer = new Mailer();   
  mailer.send({ to: params.owner.email,  subject,  html  });  
  mailer.send({ to: params.hirer.email,  subject,  html  });    
  mailer.send({ to: "enquiries@cnchire.com.au",  subject,  html  });   
}


//send bond claim to owner
exports.sendBondClaimPayoutOwnerNotifications = async (params) => {
  const form_template = await bondClaimTemplateForm(params,'bond_claim_hirer_payout.html'); 
  const subject = "BOND CLAIM - Booking #" + params.booking.id + ' - is Processed';
 
  let template = await getEmailTemplate(); 
  template = replaceAll(template, "TEMPLATE_TITLE", subject);
  template = replaceAll(template, "TEMPLATE_BODY", form_template);  

  let html = template;  

  const mailer = new Mailer();  

  mailer.send({ to: params.owner.email,  subject,  html  });     
  mailer.send({ to: "enquiries@cnchire.com.au",  subject : '[sent to owner]' + subject,  html  }); 
}

//send bond claim to hirer
exports.sendBondClaimPayoutHirerNotifications = async (params) => {
  const form_template = await bondClaimTemplateForm(params,'bond_claim_hirer_payout.html'); 
  const subject = "BOND Refunded - Booking #" + params.booking.id + '';
 
  let template = await getEmailTemplate(); 
  template = replaceAll(template, "TEMPLATE_TITLE", subject);
  template = replaceAll(template, "TEMPLATE_BODY", form_template);  

  let html = template;   
  const mailer = new Mailer();   
  mailer.send({ to: params.hirer.email,  subject,  html  });    
  mailer.send({ to: "enquiries@cnchire.com.au",  subject : '[sent-to-hirer]' + subject,  html  }); 
}








exports.sendEnquiryNotification = async (params) => {  
   let template = await getContent(__dirname + "/../../../templates/enquiry.html"); 
   template = replaceAll(template, "FIRST_NAME", params.first_name);
   template = replaceAll(template, "LAST_NAME", params.last_name);
   template = replaceAll(template, "CONTACT_NUMBER",params.contact_number);
   template = replaceAll(template, "EMAIL",params.email);
   template = replaceAll(template, "ADDRESS_1",params.address_1);
   template = replaceAll(template, "ADDRESS_2",params.address_2);
   
   template = replaceAll(template, "VEHICLE_NAME",params.travel_vehicle);
   template = replaceAll(template, "VEHICLE_SUBURB",params.travel_suburb);

   template = replaceAll(template, "DESTINATION_SUBURB",params.travel_destination_suburb);
   template = replaceAll(template, "DESTINATION_STATE",params.travel_destination_state);
   template = replaceAll(template, "VEHICLE_STATE",params.travel_state);


   template = replaceAll(template, "SUBURB",params.suburb);
   template = replaceAll(template, "STATE",params.state);
   template = replaceAll(template, "POSTCODE",params.postcode);  

   
   template = replaceAll(template, "DEPARTURE_DATE",params.travel_departure);
   template = replaceAll(template, "RETURN_DATE",params.travel_return);
   
   template = replaceAll(template, "NO_ADULTS", params.travel_adults);
   template = replaceAll(template, "NO_CHILDREN", params.travel_children);
   template = replaceAll(template, "FREE_CAMP", parseInt(params.travel_free_camp) === 0 ? "NO" : "YES");      
   template = replaceAll(template, "VEHICLE_MAKE",params.towing_vehicle_make);
   template = replaceAll(template, "VEHICLE_MODEL", params.towing_vehicle_model);
   template = replaceAll(template, "BRAKED_TOWING_CAPACITY",params.towing_towing_capacity);
   template = replaceAll(template, "TOW_BAR_RATING",params.towing_tow_bar);
   template = replaceAll(template, "VEHICLE_BRAKE_CONTROL", parseInt(params.towing_brake_control) === 0 ? "NO" : "YES" );      
   template = replaceAll(template, "OPTIONAL_EXTRAS",params.info_extra);
   template = replaceAll(template, "TOWING_EXPERIENCE", params.info_experience_towing); 
   template = replaceAll(template, "BOOKING_NOTES",params.info_notes);
   

    
   let subject = "Vehicle Enquiry";
   let html = template; 

   const mailer = new Mailer();  
   mailer.send({ to: "enquiries@cnchire.com.au",  subject,  html  });  
   mailer.send({ to: "jamesmartinezjr2018+3@gmail.com",  subject,  html  });  

   return true; 
} 

  
//send to all status manual update. 
exports.sendBookingStatusUpdateNotifications = async (params, status) =>{  
  const booking = params.booking;  
  let subject =  "Booking #" + booking.id + " - Status updated to " + status;     
  sendBookingNotification(params.owner.email, subject , subject, params, subject);  
  sendBookingNotification(params.hirer.email, subject , subject, params,  subject);    
  sendBookingNotification("enquiries@cnchire.com.au", '[cnc]' + subject , subject, params,  subject);     
}
 

//send to hirer 
exports.sendBookingRequestRejectedNotifications = async (params) =>{   
  const booking = params.booking;  
  let subject =  "Booking #" + booking.id + " - Booking Request Rejected";    
  sendBookingNotification(params.owner.email, subject , subject, params,'','rejected');  
  sendBookingNotification("enquiries@cnchire.com.au", '[sent-to-hirer]' + subject , subject, params, "");   
} 


//send to hirer 
exports.sendBookingRequestApprovedNotifications = async (params) =>{   
  const booking = params.booking;  
  let subject =  "Booking #" + booking.id + " - Booking Request Approved";    
  //sendBookingNotification(params.owner.email, subject , subject, params,'','approved');  
  sendBookingNotification(params.hirer.email, subject , subject, params,'Owner has approved your booking. Please settle your in the dashboard, BOOKING_LINK','approved');   
  sendBookingNotification("enquiries@cnchire.com.au", '[sent-to-hirer]' + subject , subject, params,'Owner has approved your booking. Please settle your in the dashboard, BOOKING_LINK','approved');   
} 

//send to owner 
exports.sendBookingRequestNotifications = async (params) =>{   
  const booking = params.booking;  
  let subject =  "Booking #" + booking.id + " - Booking Request";    
  sendBookingNotification(params.owner.email, subject , subject, params,'Please review this booking request for approval, BOOKING_LINK','request');  
  sendBookingNotification("enquiries@cnchire.com.au", '[sent-to-owner]' + subject , subject, params, "");   
} 


//send to hirer/owner
exports.sendBookingRequestCancelledNotifications = async (params) =>{   
  const booking = params.booking;  
  let subject =  "Booking #" + booking.id + " - Booking Request Cancelled";     
  sendBookingNotification(params.hirer.email, subject , subject, params,'','cancelled');   
  sendBookingNotification(params.owner.email, subject , subject, params,'','cancelled');   
  sendBookingNotification("enquiries@cnchire.com.au", '[sent-hirer-owner]' + subject , subject, params,'','cancelled');   
} 


//send hirer,owner and admin a payment notification copy
exports.sendBookingPaymentNotifications = async (params) =>{  
  const booking = params.booking;  
  let subject = "";

  switch(booking.status){ 
    case 'partial-payment': 
       subject = "Booking # " + booking.id + " - Partially paid";  
    break;  
    default: 
       subject =  "Booking # " + booking.id + " - Fully paid";  
  } 
 
  sendBookingNotification(params.owner.email, subject , subject, params, 'This booking is now fully paid. Please coordinate with the hirer in the chat channel in your dashboard.');  
  sendBookingNotification(params.hirer.email, subject , subject, params);  
  sendBookingNotification("enquiries@cnchire.com.au", '[cnc]' + subject , subject, params);   
}

exports.sendBookingOnHireNotifications = async (params) =>{   
  const booking = params.booking;  
  let subject =  "Booking # " + booking.id + " - is On Hire";   

  sendBookingNotification(params.hirer.email, subject , subject, params);   
  sendBookingNotification(params.owner.email, subject , subject, params);  
  sendBookingNotification("enquiries@cnchire.com.au", '[cnc]' + subject , subject, params, "Please make arrangements to pay the owner, you can view the order's details <a href='BOOKING_LINK'>here</a>");   
} 


//send it to admin 
exports.sendReadyForRefundNotification = async (params) =>{   
  const booking = params.booking;  
  let subject =  "Booking # " + booking.id + " - Bond Ready for Refund";   
  sendBookingNotification("jamesmartinezjr2018+3@gmail.com", subject , subject, params, "Hirer can now have its bond refunded. Order details are referenced below.");   
  sendBookingNotification( "enquiries@cnchire.com.au", '[cnc]' + subject , subject, params, "Hirer can now have its bond refunded. Order details are referenced below.");    
}
 
//send it to admin 
exports.sendWithHoldFundNotification = async (params) =>{   
  const booking = params.booking;  
  let subject =  "Booking # " + booking.id + " - Bond is withheld by owner";   
  sendBookingNotification("jamesmartinezjr2018+3@gmail.com", subject , subject, params, "Please investigate this withholding request.");   
  sendBookingNotification( "enquiries@cnchire.com.au",  '[cnc]' + subject , subject, params, "Please investigate this withholding request.");   
}


//send it to hirer
exports.sendBondRefundedNotification = async (params) =>{   
  const booking = params.booking;  
  let subject =  "Booking # " + booking.id + " - Bond refunded";   
  sendBookingNotification(params.hirer.email, subject , subject, params, "", "refunded");    
  sendBookingNotification("enquiries@cnchire.com.au", '[sent-to-hirer]' + subject  , subject, params, "This email copy is sent to hirer", "refunded");     
}


//only owner should receive this 
exports.sendOnHirePaymentNotification = async (params) =>{   
  const booking = params.booking;  
  let subject =  "Booking # " + booking.id + " - Payout is processed";   
  sendBookingNotification(params.owner.email, subject , subject, params, "", "payout");    
  sendBookingNotification("enquiries@cnchire.com.au", '[sent-to-owner]' + subject  , subject, params, "This email copy is sent to owner", "payout");     
}
 

exports.sendBookingRequestCopyToHirer = async (params) =>{  
  sendBookingNotification(params.hirer.email, "Thank you for your booking request!",  "NEW BOOKING # " + params.booking.id, params);  
}    
