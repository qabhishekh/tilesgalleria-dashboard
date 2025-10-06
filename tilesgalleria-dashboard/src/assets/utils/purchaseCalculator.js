 $(document).ready(function(){
	$(document).on('click', '#checkAll', function() {          	
		$(".itemRow").prop("checked", this.checked);
	});	
	$(document).on('click', '.itemRow', function() {  	
		if ($('.itemRow:checked').length == $('.itemRow').length) {
			$('#checkAll').prop('checked', true);
		} else {
			$('#checkAll').prop('checked', false);
		}
	});  
	var count = $(".itemRow").length;
	$(document).on('click', '#addRows', function() { 
		count++;
		var htmlRows = '';
		htmlRows += '<tr>';
		htmlRows += '<td><input class="itemRow" type="checkbox"></td>';          
		htmlRows += '<td><input type="text" name="productCode[]" id="productCode_'+count+'" class="form-control" autocomplete="off" onkeyup="getSuggestions(this.value,this.id)"><input type="hidden" name="productType[]" id="productType_'+count+'" class="form-control" autocomplete="off" onkeyup="getSuggestions(this.value,this.id)"></td>';          
		htmlRows += '<td><image src="assets/img/logo.png" id="image_'+count+'"></td>';     
		htmlRows += '<td><input type="number" name="selling_price[]" id="selling_price_'+count+'" class="form-control price" autocomplete="off"></td>';		 
		htmlRows += '<td><input type="number" name="quantity[]" id="quantity_'+count+'" class="form-control quantity" autocomplete="off"></td>';   		
		htmlRows += '<td><input type="number" name="no_of_boxes[]" id="no_of_boxes_'+count+'" class="form-control quantity" autocomplete="off"></td>';   		
		htmlRows += '<td><input type="number" name="price[]" id="price_'+count+'" class="form-control price" autocomplete="off"></td>';		 
		htmlRows += '<td><input type="number" name="total[]" id="total_'+count+'" class="form-control total" autocomplete="off"></td>';          
		htmlRows += '</tr>';
		$('#invoiceItem').append(htmlRows);
	}); 
	$(document).on('click', '#removeRows', function(){
		$(".itemRow:checked").each(function() {
			$(this).closest('tr').remove();
		});
		$('#checkAll').prop('checked', false);
		calculateTotal();
	});		
	$(document).on('blur', "[id^=quantity_]", function(){
		calculateTotal();
	});	
	$(document).on('blur', "[id^=price_]", function(){
		calculateTotal();
	});	
	$(document).on('blur', "#subTotal", function(){		
		calculateTotal();
	});	
	$(document).on('blur', "#discount", function(){		
		calculateTotal();
	});	
	$(document).on('blur', "#amount_after_discount", function(){		
		calculateTotal();
	});	
	$(document).on('blur', "#gst", function(){		
		calculateTotal();
	});	
	$(document).on('blur', "#grand_total", function(){		
		calculateTotal();
	});	
	$(document).on('blur', "#shipping_charge", function(){		
		calculateTotal();
	});	
	$(document).on('blur', "#Balance", function(){		
		calculateTotal();
	});	
	$(document).on('blur', "#amountPaid", function(){
		calculateTotal();

	});	
	$(document).on('click', '.deleteInvoice', function(){
		var id = $(this).attr("id");
		if(confirm("Are you sure you want to remove this?")){
			$.ajax({
				url:"action.php",
				method:"POST",
				dataType: "json",
				data:{id:id, action:'delete_invoice'},				
				success:function(response) {
					if(response.status == 1) {
						$('#'+id).closest("tr").remove();
					}
				}
			});
		} else {
			return false;
		}
	});
});	
function calculateTotal(){
    
	var totalAmount = 0; 
	$("[id^='price_']").each(function() {
		var id = $(this).attr('id');
		id = id.replace("price_",'');
		var price = $('#price_'+id).val();
	let debounceTimeout;
let adjusted_quantity = 1;
$('#quantity_' + id).on('input', function () {
    clearTimeout(debounceTimeout);
    const inputElement = $(this);

    debounceTimeout = setTimeout(() => {
        let quantity = inputElement.val();
        if (!quantity || isNaN(quantity)) {
            $('#no_of_boxes_' + id).val(0);
            adjusted_quantity = 1;
            return;
        }

        quantity = parseFloat(quantity);
        var product_type = $('#productType_'+id).val();
        if(product_type=='Tiles'){
    console.log(product_type);
        var calc_box = 1.44;
        }
        else{
    console.log(product_type);
     var calc_box = 2.1;
        }
        var no_of_boxes = Math.ceil(quantity / calc_box);
        adjusted_quantity = no_of_boxes * calc_box;

        $('#no_of_boxes_' + id).val(no_of_boxes);
        if (quantity !== adjusted_quantity) {
            inputElement.val(adjusted_quantity.toFixed(2));
            calculateTotal();
        }
    }, 1000);
});
var quantity_new = $('#quantity_'+id).val();
var total = price * quantity_new;
		$('#total_'+id).val(parseFloat(total).toFixed(2));
		totalAmount += total;			
	});
     var subtotal = totalAmount;
     	$('#grand_total').val(totalAmount);
	$('#subTotal').val(parseFloat(subtotal));
var Discount = parseFloat($('#discount').val());
var amount_after_discount = parseFloat($('#amount_after_discount').val());
var Amount_after_discount=subtotal-Discount;
	$('#amount_after_discount').val(Amount_after_discount);
     var total_gst = Amount_after_discount*10/100;
	$('#gst').val(parseFloat(total_gst));
	var Shipping_charge = parseFloat($('#shipping_charge').val());
	totalAmount_new=Amount_after_discount+total_gst+Shipping_charge;
	$('#grand_total').val(totalAmount_new);
	var subTotal = parseFloat($('#grand_total').val());
var Balance = parseFloat($('#Balance').val());
var total = subTotal;
	if(subTotal) {
		var amountPaid = $('#amountPaid').val(); // Parse the value as float
		console.log(amountPaid);
var subTotal = parseFloat($('#grand_total').val());
if (amountPaid && subTotal) {
  Balance = subTotal - amountPaid;
  console.log(Balance);
  $('#Balance').val(Balance);
}else if(subTotal){
  Balance = subTotal - amountPaid;
  console.log(Balance);
  $('#Balance').val(Balance);

} else {
}

	}
}

 

// utils/purchaseCalculator.js

export function calculateTotals(rows, discount, shipping, advance) {
  let totalAmount = 0;

  rows.forEach((row) => {
    const price = parseFloat(row.purchasePrice) || 0;
    const qty = parseFloat(row.quantity) || 0;

    totalAmount += price * qty;
  });

  const subTotal = totalAmount;
  const discountValue = parseFloat(discount) || 0;
  const amountAfterDiscount = subTotal - discountValue;

  const gst = (amountAfterDiscount * 10) / 100;
  const shippingCharge = parseFloat(shipping) || 0;

  const grandTotal = amountAfterDiscount + gst + shippingCharge;
  const advanceValue = parseFloat(advance) || 0;
  const balance = grandTotal - advanceValue;

  return {
    subTotal: subTotal.toFixed(2),
    amountAfterDiscount: amountAfterDiscount.toFixed(2),
    gst: gst.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
    balance: balance.toFixed(2),
  };
}

export function adjustQuantityByBox(quantity, productType) {
  if (!quantity || isNaN(quantity)) return { adjustedQty: 0, boxes: 0 };

  let calcBox = 1.44; // Tiles default
  if (productType !== "Tiles") {
    calcBox = 2.1; // Others
  }

  const no_of_boxes = Math.ceil(quantity / calcBox);

  return {
    adjustedQty: quantity, // user typed quantity 그대로 रहेगा
    boxes: no_of_boxes,
  };
}
