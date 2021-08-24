from django.shortcuts import render

from django.views import View

from .models import LineItem, Invoice
from App.forms import LineItemFormset, InvoiceForm

# Create your views here.


class InvoiceListView(View):
    def get(self, *args, **kwargs):
        invoices = Invoice.objects.all()
        
        context = {
            "invoices":invoices,
        }

        return render(self.request, 'invoice/invoice-list.html', context)
    
    def post(self, request):        
        # import pdb;pdb.set_trace()
        invoice_ids 	= request.POST.getlist("invoice_id")
        invoice_ids 	= list(map(int, invoice_ids))

        update_status_for_invoices = int(request.POST['status'])
        
        invoices = Invoice.objects.filter(id__in=invoice_ids)

        if update_status_for_invoices == 0:
            invoices.update(status=False)
        else:
            invoices.update(status=True)

        return redirect('invoice:invoice-list')

def createInvoice(request):
    """
    Invoice Generator page it will have Functionality to create new invoices, 
    this will be protected view, only admin has the authority to read and make
    changes here.
    """

    heading_message = 'Formset Demo'
    if request.method == 'GET':
        formset 	= LineItemFormset(request.GET or None)
        form 		= InvoiceForm(request.GET or None)
    elif request.method == 'POST':
        formset 	= LineItemFormset(request.POST)
        form 		= InvoiceForm(request.POST)
        
        if form.is_valid():
            invoice = Invoice.objects.create(
							customer 		=	form.data["customer"],
	                    	customer_email	=	form.data["customer_email"],
	                    	billing_address = 	form.data["billing_address"],
	                    	date 			=	form.data["date"],
	                    	due_date		= 	form.data["due_date"], 
	                    	message 		=	form.data["message"],
	                	)
            
        if formset.is_valid():
            # extract name and other data from each form and save
            
            total = 0
            for form in formset:
                service 			= form.cleaned_data.get('service')
                description 		= form.cleaned_data.get('description')
                quantity 			= form.cleaned_data.get('quantity')
                rate 				= form.cleaned_data.get('rate')
                
                if service and description and quantity and rate:
                    amount = float(rate)*float(quantity)
                    total += amount

                    LineItem(customer 	= invoice,
                            service		= service,
                            description	= description,
                            quantity	= quantity,
                            rate 		= rate,
                            amount 		= amount).save()

            invoice.total_amount = total
            invoice.save()

            try:
                generate_PDF(request, id=invoice.id)
            except Exception as e:
                print(f"********{e}********")
            return redirect('/')

    context = {
        "title" : "Invoice Generator",
        "formset": formset,
        "form": form,
    }
    return render(request, 'invoice/invoice-create.html', context)
