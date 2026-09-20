namespace OficinaMecanica.Domain.Entities
{
    public class Oficina
    {
        public Guid Id { get; private set; }

        public int UsuarioId { get; private set; }

        public string Nome { get; private set; } = string.Empty;

        public string RazaoSocial { get; private set; } = string.Empty;

        public string Cnpj { get; private set; } = string.Empty;

        public string InscricaoEstadual { get; private set; } = string.Empty;

        public string Telefone { get; private set; } = string.Empty;

        public string Email { get; private set; } = string.Empty;

        public string Cep { get; private set; } = string.Empty;

        public string Logradouro { get; private set; } = string.Empty;

        public string Numero { get; private set; } = string.Empty;

        public string Complemento { get; private set; } = string.Empty;

        public string Bairro { get; private set; } = string.Empty;

        public string Cidade { get; private set; } = string.Empty;

        public string Uf { get; private set; } = string.Empty;

        public string Endereco { get; private set; } = string.Empty;

        public string? Logotipo { get; private set; }

        private Oficina()
        {
        }

        public Oficina(
            int usuarioId,
            string nome,
            string razaoSocial,
            string cnpj,
            string inscricaoEstadual,
            string telefone,
            string email,
            string cep,
            string logradouro,
            string numero,
            string complemento,
            string bairro,
            string cidade,
            string uf,
            string endereco,
            string? logotipo = null)
        {
            Id = Guid.NewGuid();
            UsuarioId = usuarioId;
            Nome = nome;
            RazaoSocial = razaoSocial;
            Cnpj = cnpj;
            InscricaoEstadual = inscricaoEstadual;
            Telefone = telefone;
            Email = email;
            Cep = cep;
            Logradouro = logradouro;
            Numero = numero;
            Complemento = complemento;
            Bairro = bairro;
            Cidade = cidade;
            Uf = uf;
            Endereco = endereco;
            Logotipo = logotipo;
        }

        public void AtualizarDados(
            string nome,
            string razaoSocial,
            string cnpj,
            string inscricaoEstadual,
            string telefone,
            string email,
            string cep,
            string logradouro,
            string numero,
            string complemento,
            string bairro,
            string cidade,
            string uf,
            string endereco,
            string? logotipo = null)
        {
            Nome = nome;
            RazaoSocial = razaoSocial;
            Cnpj = cnpj;
            InscricaoEstadual = inscricaoEstadual;
            Telefone = telefone;
            Email = email;
            Cep = cep;
            Logradouro = logradouro;
            Numero = numero;
            Complemento = complemento;
            Bairro = bairro;
            Cidade = cidade;
            Uf = uf;
            Endereco = endereco;
            Logotipo = logotipo;
        }
    }
}