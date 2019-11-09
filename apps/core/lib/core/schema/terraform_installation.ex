defmodule Core.Schema.TerraformInstallation do
  use Piazza.Ecto.Schema
  alias Core.Schema.{Terraform, Installation}

  schema "terraform_installations" do
    belongs_to :installation, Installation
    belongs_to :terraform, Terraform

    timestamps()
  end

  def for_terraform(query \\ __MODULE__, terraform_id) do
    from(ti in query,
      join: c in assoc(ti, :terraform), as: :terraform,
      where: c.id == ^terraform_id)
  end

  def for_user(query, user_id) do
    from([ti, terraform: c] in query,
      join: inst in Installation,
        on: inst.id == ti.installation_id and c.repository_id == inst.repository_id,
      where: inst.user_id == ^user_id
    )
  end

  @valid ~w(installation_id terraform_id)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:installation_id, :terraform_id])
    |> foreign_key_constraint(:installation_id)
    |> foreign_key_constraint(:terraform_id)
    |> unique_constraint(:terraform, name: index_name(:terraform_installations, [:terraform_id, :installation_id]))
  end
end