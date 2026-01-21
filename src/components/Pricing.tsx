import { useState, useEffect } from "react";
import { QuotationDetail } from "./pricing/QuotationDetail";
import { QuotationsListWithFilters } from "./pricing/QuotationsListWithFilters";
import { QuotationBuilderV3 } from "./pricing/quotations/QuotationBuilderV3";
import type { QuotationNew } from "../types/pricing";
import { ContactsListWithFilters } from "./crm/ContactsListWithFilters";
import { PricingContactDetail } from "./pricing/PricingContactDetail";
import { CustomersListWithFilters } from "./crm/CustomersListWithFilters";
import { CustomerDetail } from "./bd/CustomerDetail";
import { PricingCustomerDetail } from "./pricing/PricingCustomerDetail";
import { NetworkPartnersModule } from "./pricing/NetworkPartnersModule";
import { PricingReports } from "./pricing/PricingReports";
import type { Contact, Customer } from "../types/bd";
import { ContactsModuleWithBackend } from "./crm/ContactsModuleWithBackend";
import { projectId, publicAnonKey } from '../utils/supabase/info';

export type PricingView = "contacts" | "customers" | "quotations" | "vendors" | "reports";
type SubView = "list" | "detail" | "create";

interface PricingProps {
  view?: PricingView;
  onViewInquiry?: (inquiryId: string) => void;
  inquiryId?: string | null;
  currentUser?: { name: string; email: string; department: string } | null;
  onCreateTicket?: (quotation: QuotationNew) => void;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c142e950`;

export function Pricing({ view = "contacts", onViewInquiry, inquiryId, currentUser, onCreateTicket }: PricingProps) {
  const [subView, setSubView] = useState<SubView>("list");
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationNew | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [quotations, setQuotations] = useState<QuotationNew[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Map department name to userDepartment format
  const userDepartment: "BD" | "PD" = currentUser?.department === "Pricing" ? "PD" : "BD";

  // Fetch quotations from backend
  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching quotations from:', `${API_URL}/quotations?department=pricing`);
      
      const response = await fetch(`${API_URL}/quotations?department=pricing`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setQuotations(result.data);
        console.log(`Fetched ${result.data.length} quotations for Pricing`);
      } else {
        console.error('Error fetching quotations:', result.error);
        alert('Error loading quotations: ' + result.error);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      alert('Unable to connect to server. Please check your connection or try again later.\n\nError: ' + error);
      // Set empty array so UI doesn't break
      setQuotations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch quotations when view changes to quotations
  useEffect(() => {
    if (view === "quotations") {
      fetchQuotations();
    }
  }, [view]);

  // Reset to list view when switching between main views
  useEffect(() => {
    setSubView("list");
    setSelectedQuotation(null);
    setSelectedContact(null);
    setSelectedCustomer(null);
  }, [view]);

  // Handle inquiryId prop - when set, show the detail view for that inquiry
  useEffect(() => {
    if (inquiryId && view === "quotations") {
      const inquiry = quotations.find(q => q.id === inquiryId);
      if (inquiry) {
        setSelectedQuotation(inquiry);
        setSubView("detail");
      }
    }
  }, [inquiryId, view, quotations]);

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setSubView("detail");
  };

  const handleBackFromContact = () => {
    setSelectedContact(null);
    setSubView("list");
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSubView("detail");
  };

  const handleBackFromCustomer = () => {
    setSelectedCustomer(null);
    setSubView("list");
  };

  const handleViewQuotation = (quotation: QuotationNew) => {
    setSelectedQuotation(quotation);
    setSubView("detail");
  };

  const handleBackFromQuotation = () => {
    setSelectedQuotation(null);
    setSubView("list");
  };

  const handleEditQuotation = () => {
    // Keep the selected quotation and switch to create mode for editing
    setSubView("create");
  };

  const handleCreateQuotation = () => {
    setSelectedQuotation(null);
    setSubView("create");
  };

  const handleBackFromCreate = () => {
    setSelectedQuotation(null);
    setSubView("list");
  };

  const handleSaveQuotation = async (data: QuotationNew) => {
    console.log("Saving quotation:", data);
    
    try {
      // Determine if this is create or update
      const isUpdate = !!data.id && data.id.startsWith('QUO-');
      
      if (isUpdate) {
        // Update existing quotation
        const response = await fetch(`${API_URL}/quotations/${data.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('Quotation updated successfully');
          await fetchQuotations(); // Refresh list
          setSubView("list");
        } else {
          console.error('Error updating quotation:', result.error);
          alert('Error updating quotation: ' + result.error);
        }
      } else {
        // Create new quotation
        const response = await fetch(`${API_URL}/quotations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('Quotation created successfully:', result.data.id);
          await fetchQuotations(); // Refresh list
          setSubView("list");
        } else {
          console.error('Error creating quotation:', result.error);
          alert('Error creating quotation: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('Error saving quotation: ' + error);
    }
  };

  const handleUpdateQuotation = async (updatedQuotation: QuotationNew) => {
    // Update the selected quotation in state
    setSelectedQuotation(updatedQuotation);
    
    try {
      const response = await fetch(`${API_URL}/quotations/${updatedQuotation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedQuotation)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("Quotation updated successfully");
        await fetchQuotations(); // Refresh list
      } else {
        console.error('Error updating quotation:', result.error);
      }
    } catch (error) {
      console.error('Error updating quotation:', error);
    }
  };

  const handleDeleteQuotation = async () => {
    if (!selectedQuotation) return;
    
    try {
      const response = await fetch(`${API_URL}/quotations/${selectedQuotation.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("Quotation deleted successfully");
        await fetchQuotations(); // Refresh list
        setSubView("list"); // Go back to list
        setSelectedQuotation(null);
      } else {
        console.error('Error deleting quotation:', result.error);
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
    }
  };

  const handleCreateInquiry = (customer: Customer) => {
    // Pre-fill customer info and open quotation builder
    const inquiryTemplate: Partial<QuotationNew> = {
      customer_id: customer.id,
      customer_name: customer.company_name,
      customer_company: customer.company_name,
      status: "Pending Pricing",
    };
    setSelectedQuotation(inquiryTemplate as QuotationNew);
    setSubView("create");
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--neuron-bg-page)" }}>
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {view === "contacts" && (
          <>
            {subView === "list" && (
              <ContactsListWithFilters 
                userDepartment="PD"
                onViewContact={handleViewContact} 
              />
            )}
            {subView === "detail" && selectedContact && (
              <PricingContactDetail contact={selectedContact} onBack={handleBackFromContact} />
            )}
          </>
        )}

        {view === "customers" && (
          <>
            {subView === "list" && (
              <CustomersListWithFilters 
                userDepartment="PD"
                onViewCustomer={handleViewCustomer} 
              />
            )}
            {subView === "detail" && selectedCustomer && (
              <PricingCustomerDetail 
                customer={selectedCustomer} 
                onBack={handleBackFromCustomer}
                onCreateInquiry={handleCreateInquiry}
                onViewInquiry={onViewInquiry}
              />
            )}
          </>
        )}

        {view === "quotations" && (
          <>
            {subView === "list" && (
              <QuotationsListWithFilters 
                onViewItem={handleViewQuotation}
                onCreateQuotation={handleCreateQuotation}
                quotations={quotations}
                isLoading={isLoading}
                userDepartment="PD"
              />
            )}
            {subView === "detail" && selectedQuotation && (
              <QuotationDetail 
                quotation={selectedQuotation} 
                onBack={handleBackFromQuotation}
                userDepartment={userDepartment}
                onUpdate={handleUpdateQuotation}
                onEdit={handleEditQuotation}
                onCreateTicket={onCreateTicket}
                onConvertToProject={(projectId) => {
                  // PD users cannot convert to project directly
                  // This callback won't be triggered as the button only shows for BD users
                  console.log("Project conversion not available for PD users");
                }}
                currentUser={currentUser}
                onDelete={handleDeleteQuotation}
              />
            )}
            {subView === "create" && (
              <QuotationBuilderV3 
                onClose={handleBackFromCreate}
                onSave={handleSaveQuotation}
                initialData={selectedQuotation || undefined}
                builderMode="quotation"
              />
            )}
          </>
        )}



        {view === "vendors" && <NetworkPartnersModule />}

        {view === "reports" && <PricingReports />}
      </div>
    </div>
  );
}