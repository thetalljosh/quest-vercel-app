# Azure Infrastructure Repository

This repository contains Azure infrastructure templates, scripts, and automation tools for managing cloud resources and deployments. It includes Infrastructure as Code (IaC) templates, security configurations, certificate management, and deployment automation.

## 📂 Repository Structure

### 🔐 ACME Certificate Automation
- **`acme-automation/`** - Automated TLS certificate management with Let's Encrypt
  - PowerShell scripts for certificate generation and Azure Key Vault integration
  - Azure DevOps pipeline configuration for automated certificate lifecycle management
  - Configuration file for certificate domains and Key Vault settings
  - [Reference Documentation](https://medium.com/@brentrobinson5/automating-certificate-management-with-azure-and-lets-encrypt-fee6729e2b78)

### 🏗️ Infrastructure as Code (IaC)
- **`IaC/`** - Core infrastructure templates and modules
  - **`core-infrastructure-bicep/`** - Hub and spoke network architectures
  - **`Functions/`** - Azure Functions infrastructure templates
  - **`IAM/`** - Identity and Access Management configurations
  - **`policy-bicep/ALZ-Bicep/`** - Azure Landing Zone Bicep templates and policies

### 👥 Identity & Access Management (IAM)
- **`IAM/`** - Role-based access control (RBAC) and security configurations
  - Custom role definitions
  - Management group and resource group role assignments
  - Modular RBAC templates for scalable permission management

### � Digital Products Platform
- **`Digital Products/`** - Enterprise microservices platform infrastructure
  - **Multi-environment deployment** (Dev/Test/Prod) with environment-specific configurations
  - **Microservices Architecture**:
    - **Public API** - Customer-facing REST API services
    - **JobSight** - Project management and customer portal applications
    - **CRM API** - Customer relationship management services
    - **Geo API** - Location and mapping services
    - **Notifications API** - Messaging and notification services  
    - **D365 Functions** - Microsoft Dynamics 365 integration services
    - **Operations API** - Internal operations and workflow management
  - **Shared Infrastructure**:
    - Azure App Configuration for centralized settings management
    - Application Insights for monitoring and telemetry
    - Redis Cache for high-performance caching
    - Key Vault integration for secure secrets management
    - Virtual networking with private endpoints
    - Application Gateway for load balancing and SSL termination
  - **Automated Deployment Scripts** with PowerShell-based orchestration
  - **Azure Container Registry integration** for module sharing
  - **Environment-specific parameter files** for Dev/Test/Prod deployments

### �🚀 Resource Deployment
- **`resource-deployment-bicep/`** - Ready-to-deploy Azure resource templates
  - Virtual Machine templates (Windows Server 2022/2025, Windows 11)
  - Application Gateway configurations
  - Azure SQL deployments
  - Storage accounts with SFTP
  - Network Virtual Appliance (NVA) templates
  - Premium Function Apps

### 🔧 Pipeline Scripts & Automation
- **`pipelines-scripts/`** - Build and release automation scripts
- **`posh-acme-azure/`** - Legacy ACME certificate automation (PowerShell-based)

## 🛠️ Key Features

### Digital Products Platform
- **Microservices Architecture**: Scalable, containerized applications with API-first design
- **Multi-Environment Support**: Automated Dev/Test/Prod deployment pipelines
- **Azure App Configuration**: Centralized configuration management with Key Vault integration
- **Enterprise Integration**: Dynamics 365, OTIS, and third-party service connections
- **High Availability**: Load balancing, auto-scaling, and health monitoring
- **Security**: Private endpoints, managed identities, and secure API gateways

### Certificate Management
- Automated Let's Encrypt certificate provisioning
- Integration with Cloudflare DNS validation
- Secure storage in Azure Key Vault
- Automatic renewal and deployment pipelines

### Infrastructure Templates
- **Bicep Templates**: Modern ARM template alternative with improved syntax
- **Hub & Spoke Networking**: Enterprise-grade network architectures
- **Azure Landing Zones**: Best-practice foundation for enterprise Azure deployments
- **Policy Enforcement**: Automated compliance and governance

### Security & Compliance
- Role-based access control (RBAC) modules
- Azure Policy definitions and assignments
- Management group hierarchies
- Custom role definitions for least-privilege access

## 🚀 Getting Started

### Prerequisites
- Azure CLI or Azure PowerShell
- Bicep CLI (for Infrastructure as Code deployments)
- Appropriate Azure permissions for your target resources

### Quick Deployment Examples

#### Deploy Digital Products Platform
```powershell
# Navigate to Digital Products deployment scripts
cd "Digital Products/Main/src/scripts"

# Deploy all shared infrastructure (networking, App Config, Key Vault)
.\deploy.ps1 -Shared

# Deploy development environment applications
.\deploy.ps1 -Dev

# Deploy all environments (shared + dev + test + prod)
.\deploy.ps1 -All

# Tear down test environment resources
.\teardown.ps1 -Test
```

#### Deploy Specific Digital Products Services
```powershell
# Deploy to subscription scope with specific parameters
cd "Digital Products/Main/src/resources/nonshared"

# Deploy using Azure CLI for test environment
az deployment sub create \
  --name "digital-products-test" \
  --location eastus2 \
  --template-file nonshared.main.bicep \
  --parameters deployTest=true deployDev=false deployProd=false
```

#### Deploy a Virtual Machine
```powershell
# Navigate to VM templates
cd "resource-deployment-bicep/VM Server 2025"

# Deploy using Azure CLI
az deployment group create \
  --resource-group myResourceGroup \
  --template-file azureDeploy.bicep \
  --parameters @azureDeploy.parameters.json
```

#### Deploy Role Assignments
```powershell
# Deploy management group role assignment
cd "IAM"

az deployment mg create \
  --management-group-id myMgId \
  --template-file mgRoleAssignment.bicep \
  --location eastus2
```

#### Certificate Automation Setup
1. Configure certificate domains in `acme-automation/acmeconfig.psd1`
2. Set up Azure DevOps pipeline using `acme-automation/azure-pipelines.yml`
3. Configure service connections and required secrets

## 📋 Configuration Files

### Digital Products Platform Configuration
File: `Digital Products/Main/src/bicepconfig.json`
```json
{
  "moduleAliases": {
    "br": {
      "sharedModules": {
        "registry": "luckbicepprodeus2acr.azurecr.io",
        "modulePath": "bicep/modules"
      }
    }
  },
  "cloud": {
    "currentProfile": "LuckCloud"
  }
}
```

### Environment-Specific Parameters
Files: `Digital Products/Main/src/parameters/{dev|test|prod}.json`
- **webapps**: API services and web applications configuration
- **functionapps**: Azure Functions for serverless processing
- **staticsites**: Static website hosting configuration

Key Digital Products Applications:
- **Public API**: Customer-facing REST API (`publicapi`)
- **JobSight**: Project management portal (`jobsight`)
- **CRM API**: Customer relationship services (`crm`)
- **Geo API**: Location and mapping services (`geo`)
- **D365 Functions**: Dynamics 365 integration (`d365`)

### ACME Certificate Configuration
File: `acme-automation/acmeconfig.psd1`
```powershell
@{
    AcmeDirectory      = 'LE_PROD'  # Let's Encrypt environment
    AcmeContact        = @('admin@company.com')
    CertificateNames   = @('*.domain.com', 'api.domain.com')
    KeyVaultResourceId = '/subscriptions/.../providers/Microsoft.KeyVault/vaults/vault-name'
}
```

## 🔧 Azure DevOps Integration

The repository includes several Azure DevOps pipeline configurations:
- **Certificate Management**: `acme-automation/azure-pipelines.yml`
- **Policy Validation**: Various pipeline files in `IaC/policy-bicep/ALZ-Bicep/tests/pipelines/`

## 📚 Directory Details

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `Digital Products/` | Enterprise microservices platform | `deploy.ps1`, `shared.main.bicep`, `nonshared.main.bicep` |
| `acme-automation/` | TLS certificate automation | `New-AcmeCertificate.ps1`, `azure-pipelines.yml` |
| `IaC/core-infrastructure-bicep/` | Network infrastructure | Hub and spoke Bicep templates |
| `IAM/` | Access control | Role assignment modules |
| `resource-deployment-bicep/` | Resource templates | VM, App Gateway, Storage templates |
| `IaC/policy-bicep/ALZ-Bicep/` | Azure Landing Zones | Enterprise-scale templates |

## 🤝 Contributing

1. Follow naming conventions established in existing templates
2. Include parameter files for all Bicep templates
3. Test deployments in development environment before committing
4. Update documentation when adding new templates or scripts

## 📖 Additional Resources

- [Azure Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Azure Landing Zones](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Azure DevOps Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/)

## ⚠️ Important Notes

- Always review parameter files before deployment
- Ensure proper RBAC permissions are in place
- Test certificate automation in staging environment first
- Follow your organization's change management procedures

---

**Last Updated**: October 2025  
**Maintained By**: Infrastructure Team