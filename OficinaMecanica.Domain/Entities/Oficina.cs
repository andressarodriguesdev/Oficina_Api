namespace OficinaMecanica.Domain.Entities
{
    public class Oficina
    {
        public Guid Id { get; private set; }

        public int UsuarioId { get; private set; }

        public string Nome { get; private set; } = string.Empty;

        public string Telefone { get; private set; } = string.Empty;

        public string Endereco { get; private set; } = string.Empty;

        public string? Logotipo { get; private set; }

        private Oficina() { }

        public Oficina(
            int usuarioId,
            string nome,
            string telefone,
            string endereco,
            string? logotipo = null)
        {
            Id = Guid.NewGuid();
            UsuarioId = usuarioId;
            Nome = nome;
            Telefone = telefone;
            Endereco = endereco;
            Logotipo = logotipo;
        }
    }
}